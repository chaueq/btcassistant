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
  });
}

for(const item of document.querySelectorAll('#cryptos>input[type=checkbox]')) {
  for(const crypto of settings.activeCrypto) {
    document.getElementById('ac_' + crypto).checked = true;
  }

  item.addEventListener('change', (event) => {
    const settings = getSettings();
    const crypto = event.target.id.split('_')[1];
    if(event.target.checked) {
      settings.activeCrypto.push(crypto);
    }
    else {
      settings.activeCrypto.splice(settings.activeCrypto.indexOf(crypto), 1);
    }
    setSettings(settings);
  });
}
