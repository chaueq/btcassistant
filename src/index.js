const settings = getSettings();
document.body.style.filter += ' brightness(' + settings.brightness.toFixed(2) + ')';
for(const chart of document.getElementsByTagName("canvas")) {
  chart.style.opacity = settings.chartsOpacity;
}

document.getElementById('currency').innerText = settings.currency;
document.getElementById('crypto').addEventListener('click', changeActiveCrypto);
document.getElementById('crypto').addEventListener('contextmenu', () => {
  changeActiveCrypto(false);
});
spawnInvs();
updateAllVisuals();

updateAll();
const priceUpdater = setInterval(updateAll, 15000);

showAd();
const adShower = setInterval(showAd, 3600000);

if(settings.switchInterval > 0) {
  const ac = getActiveCrypto();
  ac.lastChanged = Math.floor(Date.now() / 1000);
  setActiveCrypto(ac);
  const cryptoSwitcher = setInterval(watchActiveCrypto, 250);
}

document.addEventListener('keyup', (e) => {
  if (e.code === "Space") {
    const ac = getActiveCrypto();
    ac.paused = !ac.paused;
    const text = "Crypto auto-switch " + ((ac.paused) ? 'paused' : 'resumed');
    setActiveCrypto(ac);
    spawnNotif(text, 3);
  }
});
