function assessSell(date, incomePrcnt) {
  date = Date.parse(date)/1000;
  const time = Date.now()/1000;
  const data = getData().prices.all.prices.reverse();
  for(let i = 1; i < data.length; ++i) {
    if(data[i][1] == data[i-1][1]) {
      data.splice(i, 1);
      --i;
    }
  }


  for(let i = 0; i < data.length; ++i) {
    data[i][0] = Number(data[i][0]);
    data[i][1] = Number(data[i][1]);
  }
  let max = 0;
  for(let i = 1; i < data.length; ++i) {
    if(data[i][0] > data[max][0])
      max = i;
  }
  data.splice(0, max+1);

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
    const buy_price = data[buy][0] * 1 + (getSettings().buyFee / 100);
    if(buy_price > norm)
      continue;

    for(let sell = buy+1; sell < data.length; ++sell) {
      const sell_price = data[sell][0] / 1 + (getSettings().sellFee / 100);
      if(sell_price < buy_price)
        continue;

      const inc = (sell_price - buy_price) * (1 - (getSettings().incomeTax / 100));
      const incPrcnt = 100 * inc / buy_price;
      if(isNaN(date))
        incomes.push(incPrcnt)
      else
        incomes.push(incPrcnt / (data[sell][1] - data[buy][1]));
    }
  }

  if(incomes.length == 0)
    return true;

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
  if(!isNaN(date))
    incomePrcnt = incomePrcnt / (time - date);
  const cmp = incomePrcnt - incomesAvg;
  return (cmp > incomesDev);
}
