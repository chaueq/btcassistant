const settings = getSettings();
for(const atr in settings) {
  const obj = document.getElementsByName(atr)[0];
  obj.value = settings[atr];
  obj.title = settings[atr];
}
document.body.style.filter += ' brightness(' + settings.brightness.toFixed(2) + ')';

for(const item of document.getElementsByClassName('settingVal')) {
  item.addEventListener('change', (event) => {
    const settings = getSettings();
    settings[event.target.name] = event.target.value.match('[0-9.]+') ? Number(event.target.value) : event.target.value;
    setSettings(settings);
    window.location.reload()
  });
}
