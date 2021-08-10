function setAssessmentData(assessmentData) {
  assessmentData = JSON.stringify(assessmentData);
  window.localStorage.setItem('assessmentData', assessmentData);
}

function getAssessmentData() {
  const string = window.localStorage.getItem('assessmentData');
  return JSON.parse(string);
}

function assessSell(incomePrcnt) {
  const assessmentData = getAssessmentData();
  return incomePrcnt > assessmentData.threshold;
}

function updateSellAssessment() {
  const assessmentData = getAssessmentData();
  const data = getData();
  const time = Math.floor(Date.now()/1000);
  const sinceComputed = time - assessmentData.lastComputed;
  const prices = [
    ...data.prices.hour.prices,
    ...data.prices.day.prices,
    ...data.prices.week.prices,
    ...data.prices.month.prices,
    ...data.prices.year.prices,
    ...data.prices.all.prices
  ].reverse();

  for(let i = 0; i < prices.length; ++i) {
    prices[i][0] = Number(prices[i][0]);
    prices[i][1] = Number(prices[i][1]);
  }

  let max = 0;
  for(let i = 1; i < prices.length; ++i) {
    if(prices[i][0] > prices[max][0])
      max = i;
  }

  assessmentData.maxTime = prices[max][1];

  if(assessmentData.maxTime != prices[max][1] || sinceComputed > assessmentData.refreshPeriod) {
    setAssessmentData(assessmentData);
    computeSellAssessment();
  }

  computeSellBuyScore();
}

function computeSellAssessment() {
  const assessmentData = getAssessmentData();
  const sellAssessmentFastidiousness = getSettings().sellAssessmentFastidiousness;
  assessmentData.lastComputed = Math.floor(Date.now()/1000);
  const sinceMax = assessmentData.lastComputed - assessmentData.maxTime;
  const data =
    (sinceMax < 3600) ? getData().prices.hour.prices.reverse() :
    (sinceMax < 86400) ? getData().prices.day.prices.reverse() :
    (sinceMax < 604800) ? getData().prices.week.prices.reverse() :
    (sinceMax < 2592000) ? getData().prices.month.prices.reverse() :
    (sinceMax < 31536000) ? getData().prices.year.prices.reverse() :
    [...getData().prices.all.prices.reverse(), ...getData().prices.year.prices.reverse()];

  for(let i = 0; i < data.length; ++i) {
    data[i][0] = Number(data[i][0]);
    data[i][1] = Number(data[i][1]);
  }
  if(sinceMax >= 31536000) {
    data.sort((a,b) => {
      return a[1] - b[1];
    })
    for(let i = 1; i < data.length; ++i) {
      if(data[i][1] == data[i-1][1]) {
        data.splice(i, 1);
        --i;
      }
    }
  }
  max = 0;
  for(let i = 1; i < data.length; ++i) {
    if(data[i][0] > data[max][0])
      max = i;
  }
  data.splice(0, max+1);

  assessmentData.refreshPeriod = data[data.length-1][1] - data[data.length-2][1];
  for(let i = 0; i < data.length; ++i) {
    data[i] = data[i][0]
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

  const incomes = [];
  for(let buy = 0; buy < data.length; ++buy) {
    const buy_price = data[buy] * (1 + (getSettings().buyFee / 100));
    if(buy_price > norm)
      continue;

    for(let sell = buy+1; sell < data.length; ++sell) {
      const sell_price = data[sell] / (1 + (getSettings().sellFee / 100));
      if(sell_price < buy_price)
        continue;

      const inc = (sell_price - buy_price) * (1 - (getSettings().incomeTax / 100));
      const incPrcnt = 100 * inc / buy_price;
      incomes.push(incPrcnt);
    }
  }

  incomes.sort((a, b) => {return a-b});
  const toReject = Math.min(incomes.length - 1, Math.round(incomes.length * sellAssessmentFastidiousness));
  incomes.splice(0, toReject);

  if(incomes.length == 0) {
    assessmentData.threshold = Infinity;
    setAssessmentData(assessmentData);
    return;
  }

  let incomesAvg = 0;
  for(let i = 0; i < incomes.length; ++i) {
    incomesAvg += incomes[i];
  }
  incomesAvg /= incomes.length;
  let incomesDev = 0;
  for (var i = 0; i < incomes.length; ++i) {
    incomesDev += Math.pow(incomes[i] - incomesAvg, 2);
  }
  incomesDev /= incomes.length;
  incomesDev = Math.sqrt(incomesDev);
  assessmentData.threshold = incomesAvg + incomesDev;
  setAssessmentData(assessmentData);
}

function updateSellBuyScore() {
  const score = getAssessmentData().sellBuyScore;
  const holder = document.getElementById('sellBuyScore');
  const colors = {
    negative: countRGBColorFromGradient(
      {r:0xff, g:0xa0, b:0xa0},
      {r:0xff, g:0x00, b:0x00},
      Math.abs(score)/100
    ),
    positive: countRGBColorFromGradient(
      {r:0xa0, g:0xff, b:0xa0},
      {r:0x00, g:0xff, b:0x00},
      Math.abs(score)/100
    )
  }
  writeValue(holder, score, false, ' %', true, '', colors);
}

function computeSellBuyScore() {
  const assessmentData = getAssessmentData();
  const current = getCurrentPrice();
  const sinceMax = Math.floor(Date.now()/1000) - assessmentData.maxTime;
  const datas = getData();
  const data = [
    ...datas.prices.hour.prices,
    ...datas.prices.day.prices,
    ...datas.prices.week.prices,
    ...datas.prices.month.prices,
    ...datas.prices.year.prices,
    ...datas.prices.all.prices
  ];
  for(let i = 0; i < data.length; ++i) {
    data[i][0] = Number(data[i][0]);
    data[i][1] = Number(data[i][1]);
  }
  data.sort((a,b) => {
    return a[1] - b[1];
  })
  for(let i = 1; i < data.length; ++i) {
    if(data[i][1] == data[i-1][1]) {
      data.splice(i, 1);
      --i;
    }
  }
  max = 0;
  for(let i = 1; i < data.length; ++i) {
    if(data[i][0] > data[max][0])
      max = i;
  }
  data.splice(0, max+1);
  for(let i = 0; i < data.length; ++i) {
    data[i] = data[i][0]
  }

  data.sort((a,b) => {return a-b});

  let beaten = 0;
  for(; beaten < data.length; ++beaten) {
    if(data[beaten] > current) {
      break;
    }
  }

  const score = ((beaten / (data.length/2)) - 1) * 100;
  assessmentData.sellBuyScore = score;
  setAssessmentData(assessmentData);
}
