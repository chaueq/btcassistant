const settings = getSettings();
for(const atr in settings) {
  document.getElementsByName(atr)[0].value = settings[atr];
}
document.body.style.filter += ' brightness(' + settings.brightness.toFixed(2) + ')';

for(const item of document.getElementsByClassName('settingVal')) {
  item.addEventListener('change', (event) => {
    const settings = getSettings();
    settings[event.target.name] = Number(event.target.value);
    setSettings(settings);
    window.location.reload()
  });
}
