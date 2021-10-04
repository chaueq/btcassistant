function getCurrentPrice(crypto) {
  return getData(crypto).prices.latest;
}

function writeValue(obj, value, strong, suffix='', neutral=false, symbol='', colorsOverwrite=[]) {
  const colors = {
    negative: '#ffa0a0',
    negativeStrong: '#ff0000',
    positive: '#a0ffa0',
    positiveStrong: '#00ff00',
    neutral: '#d0d0d0'
  }
  for(atr in colorsOverwrite) {
    colors[atr] = colorsOverwrite[atr];
  }
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
      color = colors.positiveStrong;
    else
      color = colors.positive;
  }
  else if (symbol == '-') {
    if (strong)
      color = colors.negativeStrong;
    else
      color = colors.negative;
  }
  else
    color = colors.neutral;

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

  if(getSettings().hideSensitive) {
    const fields = inv.getElementsByClassName('invValue');
    for(let i = 1; i <= 6; ++i) {
      fields[i].innerText = '🔒';
      fields[i].style.color = '#d0d0d020'
      fields[i].classList.add('disableSelect');
    }
  }

  return document.getElementById('invContainer').appendChild(inv);
}

function appendInvTotal() {
  const totalInv = getInvTotal();
  appendInv(totalInv.date, totalInv.amount, totalInv.boughtFor).classList.add('invHeader');
}

function getInvTotal() {
    const totalInv = {
      date: 'Total',
      amount: 0,
      boughtFor: 0
    }
    const invs = getInvestments(getSettings().currency, getActiveCrypto());
    for(let i = 0; i < invs.length; ++i) {
      totalInv.amount += invs[i].amount;
      totalInv.boughtFor += invs[i].boughtFor;
    }
    return totalInv;
}

async function updateDataBTCLeft() {
  let response = await fetch("https://api.blockchain.info/charts/total-bitcoins?timespan=1year&sampled=true&metadata=false&cors=true&format=json");
  if(response.ok) {
    let btcMined = await response.json();
    btcMined = btcMined.values;
    btcMined = btcMined[btcMined.length-1].y;
    let btcLeft = 21000000 - Number(btcMined);
    window.localStorage.setItem('btcLeft', btcLeft);
  }
  else {
    onOffline();
  }
}

function getBTCLeft() {
  try {
    const string = window.localStorage.getItem('btcLeft');
    if(string == null)
      throw null;
    return Number(string);
  }
  catch(e) {
    return 21000000;
  }
}

async function updateBTCLeft() {
  const obj = document.getElementById('btcLeft');
  const btcLeft = getBTCLeft();
  const prcntLeft = (btcLeft * 100 / 21000000);
  if(prcntLeft > 0.01)
    obj.innerText = prcntLeft.toFixed(2) + ' %';
  else if(btcLeft > 100)
    obj.innerText = btcLeft.toFixed(0) + ' ₿';
  else
    obj.innerText = btcLeft.toFixed(2) + ' ₿'

}

function getActiveCrypto() {
  return JSON.parse(window.localStorage.getItem('activeCrypto'));
}

function changeActiveCrypto() {
  const current = getActiveCrypto();
  const activeCryptos = getSettings().activeCrypto;
  window.localStorage.setItem('activeCrypto', JSON.stringify(activeCryptos[(activeCryptos.indexOf(current)+1) % activeCryptos.length]));
  clearInvs();
  spawnInvs();
  updateAllVisuals();
}

async function updateData(crypto) {
    let currency;
    switch (crypto) {
      case "BTC":
        currency = "5b71fc48-3dd3-540c-809b-f8c94d0e68b5"
        break;
      case "ETH":
        currency = "ethereum-classic"
        break;
      case "XRP":
        currency = "e17a44c8-6ea1-564f-a02c-2a9ca1d8eec4";
        break;
      case "DOGE":
        currency = "d9a3edfa-1be7-589c-bd20-c034f3830b60";
        break;
      case "ADA":
        currency = "63062039-7afb-56ff-8e19-5e3215dc404a";
        break;
    }
    let response = await fetch("https://www.coinbase.com/api/v2/assets/prices/" + currency + "?base=" + getSettings().currency);
    if (response.ok) {
      let data = await response.json();
      data = data.data;
      data.timestamp = Math.floor(Date.now()/1000);
      const all = JSON.parse(window.localStorage.getItem('data'));
      all[crypto] = data;
      window.localStorage.setItem('data', JSON.stringify(all));
    }
    else {
      onOffline();
    }
}

async function updateAllData() {
  const cryptos = getSettings().activeCrypto;
  const promises = [];
  for(const crypto of cryptos) {
    promises.push(updateData(crypto));
  }
  return Promise.all(promises);
}

function getData(crypto) {
  if(crypto == null || crypto == undefined)
    crypto = getActiveCrypto();
  return JSON.parse(window.localStorage.getItem('data'))[crypto];
}

async function setSettings(settings) {
  const old = getSettings();
  const sellAssessmentFastidiousnessChanged = (old.sellAssessmentFastidiousness != settings.sellAssessmentFastidiousness);
  const currencyChanged = (old.currency != settings.currency);
  settings = JSON.stringify(settings);
  window.localStorage.setItem('settings', settings);

  if(currencyChanged) {
    await updateAllData();
  }
  if(sellAssessmentFastidiousnessChanged || currencyChanged) {
    await computeAllSellAssessment();
  }
}

function getSettings() {
  const string = window.localStorage.getItem('settings');
  return JSON.parse(string);
}

function getAdLastShown() {
  const string = window.localStorage.getItem('aads');
  return Number(string);
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
  }, delay*1000);

  const hide1 = setTimeout(() => {
    const ad = document.getElementById('a-ads');
    ad.classList.add("transparent");
  }, (delay + 16) * 1000);
  const hide2 = setTimeout(() => {
    const ad = document.getElementById('a-ads');
    ad.classList.add("hidden");
    window.localStorage.setItem('aads', Math.floor(Date.now() / 1000));
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

async function updateInv(invId) {
  const invs = getInvestments(getSettings().currency, getActiveCrypto());
  const inv = invId <= invs.length ? invs[invId-1] : getInvTotal();
  const fields = document.getElementsByClassName('invRecord')[invId].getElementsByClassName('invValue');
  const value = getCurrentPrice() * inv.amount;
  const fee = value * (getSettings().sellFee / 100);
  const tax = Math.max(0, (value - inv.boughtFor - fee) * (getSettings().incomeTax / 100));
  const income = value - (inv.boughtFor + tax + fee);
  const incPrcnt = 100 * income / inv.boughtFor;
  const strong = (incPrcnt > 0) ? assessSell(incPrcnt) : (incPrcnt < -2.5);

  if(!getSettings().hideSensitive) {
    fields[3].innerText = value.toFixed(2);
    fields[4].innerText = fee.toFixed(2);
    fields[5].innerText = (tax > 0) ? tax.toFixed(2) : '-';
    writeValue(fields[6], income, strong);
  }
  writeValue(fields[7], incPrcnt, strong, ' %');
}

function clearInvs() {
  const invs = document.querySelectorAll('#invContainer>div.invRecord');
  for(let i = 1; i < invs.length; ++i) {
    invs[i].parentNode.removeChild(invs[i]);
  }
}

function spawnInvs() {
  const invs = getInvestments(settings.currency, getActiveCrypto());
  for(var i = 0; i < invs.length; ++i) {
    appendInv(invs[i].date, invs[i].amount, invs[i].boughtFor);
  }
  if(invs.length != 1)
    appendInvTotal();
}

async function updateAllInv() {
  const invs = document.getElementsByClassName('invRecord');
  for(let i = 1; i < invs.length; ++i) {
    updateInv(i);
  }
}

async function updateCurrentPrice() {
  const data = getData();
  const settings = getSettings();
  const raw = Number(data.prices.latest);
  const sell = raw * (1 - (settings.sellFee/100));
  const buy = raw * (1 + (settings.buyFee/100));

  document.getElementById('currentPrice').textContent = raw.toFixed(2);
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

function updateAllVisuals() {
    updateCurrentPrice();
    updateBTCLeft();
    updateSellBuyScore();
    updateAvarage('daily', 'day', 1440);
    updateAvarage('weekly', 'week', 168);
    updateAvarage('monthly', 'month', 720);
    updateAvarage('yearly', 'year', 365);
    updateHourlyChart();
    updateAllInv();
    document.getElementById('crypto').innerText = getActiveCrypto();
}

async function updateAll() {
  try {
    await Promise.all([
      updateAllData(),
      updateDataBTCLeft()
    ]);
    onOnline();
    await updateAllSellAssessment();
  }
  catch(e) {
    if(e == 'TypeError: Failed to fetch') {
      onOffline();
    }
    else {
      console.error(e);
    }
  }
  finally {
    updateAllVisuals();
  }
}

function getInvestments(currency, crypto) {
  let retrived = window.localStorage.getItem('investments');
  retrived = JSON.parse(retrived);
  const filtered = retrived.filter(((currency, crypto, inv) => {
    return (
      (inv.currency == currency || currency == null)
      &&
      (inv.crypto == crypto || crypto == null)
    );
  }).bind(null, currency, crypto));
  return filtered;
}

function saveInvestments(invs) {
  window.localStorage.setItem('investments',  JSON.stringify(invs));
}

function addInv(date, amount, boughtFor, currency, crypto) {
  let inv = Object();
  inv.date = date;
  inv.amount = Number(amount)
  inv.boughtFor = Number(boughtFor);
  inv.currency = currency;
  inv.crypto = crypto;

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
  appendListField(row, inv.currency);
  appendListField(row, inv.crypto);
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

async function onOffline() {
  const lastUpdated = new Date(getData().timestamp*1000);
  document.getElementById('dataLastUpdated').innerText =
    lastUpdated.getFullYear()
    + '-'
    + (Number(lastUpdated.getMonth()+1) < 10 ? '0' : '')
    + (lastUpdated.getMonth()+1)
    + '-'
    + (Number(lastUpdated.getDate()) < 10 ? '0' : '')
    + lastUpdated.getDate()
    + '\n'
    + (Number(lastUpdated.getHours()) < 10 ? '0' : '')
    + lastUpdated.getHours()
    + ':'
    + (Number(lastUpdated.getMinutes()) < 10 ? '0' : '')
    + lastUpdated.getMinutes()
    + ':'
    + (Number(lastUpdated.getSeconds()) < 10 ? '0' : '')
    + lastUpdated.getSeconds()
  ;
  document.getElementById('offlineNotif').classList.remove('hidden');
}

async function onOnline() {
  document.getElementById('offlineNotif').classList.add('hidden');
}

function countRGBColorFromGradient(begining, end, point) {
  const color = {
    r: 0,
    g: 0,
    b: 0
  }
  for(atr in color) {
    color[atr] = Math.round(((begining[atr] * (1-point)) + (end[atr] * point)));
    color[atr] = color[atr].toString(16);
    if(color[atr].length == 1)
      color[atr] = '0' + color[atr];
  }
  return '#' + color.r + color.g + color.b;
}

function getVersion() {
  for(part of navigator.appVersion.split(' ')) {
    const subparts = part.split('/');
    if(subparts[0] == 'BTCassistant') {
      return subparts[1];
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function cmpVersions(a, b) {
  a = a.split('.');
  b = b.split('.');

  for(let i = 0; i < Math.min(a.length, b.length); ++i) {
    if(a[i] != b[i]) {
      return a[i] > b[i];
    }
  }

  return false;
}
