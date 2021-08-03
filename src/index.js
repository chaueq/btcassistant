const settings = getSettings();
document.body.style.filter += ' brightness(' + settings.brightness.toFixed(2) + ')';
for(const chart of document.getElementsByTagName("canvas")) {
  chart.style.opacity = settings.chartsOpacity;
}

const invs = getInvestments();
for(var i = 0; i < invs.length; ++i) {
  appendInv(invs[i].date, invs[i].amount, invs[i].boughtFor);
}
appendInvTotal();

updateAll();
const priceUpdater = setInterval(updateAll, 15000);

showAd();
const adShower = setInterval(showAd, 3600000);
