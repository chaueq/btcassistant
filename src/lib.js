function getCurrentPrice() {
  return Number(document.getElementById("currentPrice").textContent);
}

function writeValue(obj, value, strong, suffix='', neutral=false, symbol='') {
  if(symbol == '') {
    if(value > 0)
      symbol = '+'
    else if(value < 0)
      symbol = '-'
    else
      symbol = '±';
  }
  var txt = neutral ? Number(Math.abs(value)).toFixed(2) + suffix : symbol + ' ' + Number(Math.abs(value)).toFixed(2) + suffix;
  if (symbol == '+') {
    if (strong)
      color = '#00ff00'
    else
      color = '#a0ffa0'
  }
  else if (symbol == '-') {
    if (strong)
      color = '#ff0000'
    else
      color = '#ffa0a0'
  }
  else
    color = '#d0d0d0'

  obj.innerText = txt;
  obj.style.color = color;
}

function appendInvField(object, value) {
  const field = document.createElement('div');
  field.classList.add('invValue');
  field.innerText = value;
  object.appendChild(field);
}

function appendInv(date, amount, boughtFor) {
  const inv = document.createElement('div');
  inv.classList.add('invRecord');

  appendInvField(inv, date);
  appendInvField(inv, amount.toFixed(8));
  appendInvField(inv, boughtFor.toFixed(2));
  for(var i = 0; i < 5; ++i)
    appendInvField(inv, '-');

  return document.getElementById('invContainer').appendChild(inv);
}

function appendInvTotal() {
  let totalAmount = 0;
  let totalBoughtFor = 0;
  const invs = document.getElementsByClassName('invRecord');
  for(let i = 1; i < invs.length; ++i) {
    const amount = Number(invs[i].getElementsByClassName('invValue')[1].innerText);
    const boughtFor = Number(invs[i].getElementsByClassName('invValue')[2].innerText);
    totalAmount += amount;
    totalBoughtFor += boughtFor;
  }
  appendInv('Total', totalAmount, totalBoughtFor).classList.add('invHeader');
}

async function updateData() {
  let response = await fetch("https://www.coinbase.com/api/v2/assets/prices/5b71fc48-3dd3-540c-809b-f8c94d0e68b5?base=PLN");
  if (response.ok) {
    let data = await response.json();
    data = JSON.stringify(data.data);
    window.localStorage.setItem('data', data);
  }
}

function getData() {
  return JSON.parse(window.localStorage.getItem('data'));
}

function setSettings(settings) {
  settings = JSON.stringify(settings);
  window.localStorage.setItem('settings', settings);
}

function getSettings() {
  try {
    const string = window.localStorage.getItem('settings');
    if(string == null)
      throw null;
    return JSON.parse(string);
  }
  catch(e) {
    const settings = {
      brightness: 1,
      chartsOpacity: 0.05,
      incomeTax: 19,
      buyFee: 2.5,
      sellFee: 2.5,
      hideSensitive: 0
    }
    setSettings(settings);
    return settings;
  }
}

function getAdLastShown() {
  try {
    const string = window.localStorage.getItem('aads');
    if(string == null)
      throw null;
    return Number(string);
  }
  catch(e) {
    return 0;
  }
}

function showAd() {
  const iframe = document.getElementById('aads');
  iframe.src = iframe.src;
  const last = getAdLastShown();
  const time = Math.floor(Date.now() / 1000);
  const delay = Math.max(60, last + 3600 - time);

  const show = setTimeout(() => {
    const ad = document.getElementById('a-ads');
    ad.classList.remove("hidden");
    ad.classList.remove("transparent");
    window.localStorage.setItem('aads', Math.floor(Date.now() / 1000));
  }, delay*1000);

  const hide1 = setTimeout(() => {
    const ad = document.getElementById('a-ads');
    ad.classList.add("transparent");
  }, (delay + 16) * 1000);
  const hide2 = setTimeout(() => {
    const ad = document.getElementById('a-ads');
    ad.classList.add("hidden");
  }, (delay + 17) * 1000);

}

async function updateHourlyChart() {
  const data = getData().prices.hour.prices.reverse();
  const canvas = document.getElementById('hourlyChart');
  for (var i = 0; i < data.length; i++) {
    data[i] = Number(data[i][0]);
  }
  data.push(getCurrentPrice());
  drawChart(canvas, data);
}

async function updateInv(inv) {
  const fields = inv.getElementsByClassName('invValue');
  const amount = Number(fields[1].innerText);
  const boughtFor = Number(fields[2].innerText);
  const value = getCurrentPrice() * amount;
  const fee = value * (getSettings().sellFee / 100);
  const tax = Math.max(0, (value - boughtFor - fee) * (getSettings().incomeTax / 100));
  const income = value - (boughtFor + tax + fee);
  const incPrcnt = 100 * income / boughtFor;
  const strong = (incPrcnt > 0) ? assessSell(incPrcnt) : (incPrcnt < -2.5);

  fields[3].innerText = value.toFixed(2);
  fields[4].innerText = fee.toFixed(2);
  fields[5].innerText = (tax > 0) ? tax.toFixed(2) : '-';
  writeValue(fields[6], income, strong);
  writeValue(fields[7], incPrcnt, strong, ' %');

  if(getSettings().hideSensitive) {
    for(let i = 1; i <= 6; ++i) {
      fields[i].style.color = "rgba(0,0,0,0)";
      fields[i].classList.add('disableSelect');
    }
  }
}

async function updateAllInv() {
  updateSellAssessment();
  const invs = document.getElementsByClassName('invRecord');
  for(let i = 1; i < invs.length; ++i) {
    updateInv(invs[i]);
  }
}

async function updateCurrentPrice() {
  let data = getData();
  document.getElementById('currentPrice').textContent = Number(data.prices.latest).toFixed(2);
}

async function updateAvarage(name, timespan) {
  const data = getData().prices[timespan].prices.reverse();

  for (var i = 0; i < data.length; ++i) {
    data[i] = Number(data[i][0])
  }


  let avg = 0;
  for (var i = 0; i < data.length; ++i) {
    avg += data[i];
  }
  avg /= data.length;
  let dev = 0;
  for (var i = 0; i < data.length; ++i) {
    dev += Math.pow(data[i] - avg, 2);
  }
  dev /= data.length;
  dev = Math.sqrt(dev);
  let norm = 0;
  let norm_count = 0;
  for (var i = 0; i < data.length; ++i) {
    if(Math.abs(data[i] - avg) <= dev) {
      norm += data[i];
      norm_count += 1;
    }
  }
  norm /= norm_count;
  cmp = getCurrentPrice() - norm;
  strong = (Math.abs(cmp) > dev);
  prcnt = 100 * cmp / avg;
  writeValue(document.getElementById(name + 'Cmp'), cmp, strong);
  writeValue(document.getElementById(name + 'Norm'), norm, strong, '', true, (cmp > 0) ? '+' : ((cmp == 0) ? '=' : '-'));
  writeValue(document.getElementById(name + 'Prcnt'), prcnt, strong, ' %');
  drawChart(document.getElementById(name + 'Chart'), data);
}

async function updateAll() {
  await updateData();
  await updateCurrentPrice();
  updateAvarage('daily', 'day', 1440);
  updateAvarage('weekly', 'week', 168);
  updateAvarage('monthly', 'month', 720);
  updateAvarage('yearly', 'year', 365);
  updateHourlyChart();
  updateAllInv();
}

function getInvestments() {
  try {
    let retrived = window.localStorage.getItem('investments');
    retrived = JSON.parse(retrived);
    if(retrived == null)
      return [];
    else
      return retrived;
  }
  catch (e) {
    return [];
  }
}

function saveInvestments(invs) {
  window.localStorage.setItem('investments',  JSON.stringify(invs));
}

function addInv(date, amount, boughtFor) {
  let inv = Object();
  inv.date = date;
  inv.amount = Number(amount)
  inv.boughtFor = Number(boughtFor);

  const invs = getInvestments();
  invs.push(inv);
  saveInvestments(invs);
}

function displayInvForm() {
  document.getElementById('invForm').classList.remove('hidden');
}

function appendListField(object, value) {
  const field = document.createElement('div');
  field.classList.add('invListValue');
  field.innerText = value;
  object.appendChild(field);
}

function appendDeleteButton(obj, id) {
  const field = document.createElement('div');
  // field.classList.add('button');
  field.classList.add('invListValue');
  field.innerText = '❌';
  field.id = id;
  field.addEventListener('click', (e) => {
    let invs = getInvestments();
    invs.splice(e.target.id, 1)
    saveInvestments(invs);
    window.location.reload(false);
  })
  obj.appendChild(field);
}

function appendListElement(inv, id) {
  const row = document.createElement('div');
  row.classList.add('invRecord');

  appendListField(row, inv.date);
  appendListField(row, inv.amount.toFixed(8));
  appendListField(row, inv.boughtFor.toFixed(2));
  appendDeleteButton(row, id);

  return document.getElementById('invContainer').appendChild(row);
}

function drawChart(canvas, data, avg=0) {
  const xPadding = 1;
  const width = canvas.width - 2*xPadding;
  const ctx = canvas.getContext("2d");
  const span = width / (data.length - 1);
  const max = Math.max.apply(null, data);
  const min = Math.min.apply(null, data);
  const yScale = canvas.height / (max-min);
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'white';
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if(avg != 0) {
    avg -= min;
    avg *= yScale;
    avg = canvas.height - avg;

    ctx.beginPath();
    ctx.moveTo(xPadding, avg);
    ctx.lineTo(width, avg);
    ctx.stroke();
  }

  for (var i = 0; i < data.length; i++) {
    data[i] -= min;
    data[i] *= yScale;
    data[i] = canvas.height - data[i];
  }

  ctx.beginPath();
  if(avg == 0)
    ctx.moveTo(xPadding, canvas.height);
  else
    ctx.moveTo(xPadding, avg);
  for (var i = 0; i < data.length; i++) {
    ctx.lineTo(i*span + xPadding, data[i]);
  }
  if(avg == 0)
    ctx.lineTo(width + xPadding, canvas.height);
  else
    ctx.lineTo(width + xPadding, avg);
  ctx.fill();

}
