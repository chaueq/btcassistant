const settings = getSettings();
document.body.style.filter += ' brightness(' + settings.brightness.toFixed(2) + ')';
for(const chart of document.getElementsByTagName("canvas")) {
  chart.style.opacity = settings.chartsOpacity;
}

document.getElementById('currency').innerText = settings.currency;
document.getElementById('crypto').addEventListener('click', () => {
  changeActiveCrypto();
  if(settings.switchInterval > 0) {
    window.location.reload();
  }
});
spawnInvs();
updateAllVisuals();

updateAll();
const priceUpdater = setInterval(updateAll, 15000);

showAd();
const adShower = setInterval(showAd, 3600000);

if(settings.switchInterval > 0) {
  const cryptoSwitcher = setInterval(changeActiveCrypto, settings.switchInterval*1000);
}
