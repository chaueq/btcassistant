const version = document.getElementById('version');
version.innerText = 'v '+getVersion();

for(setting in defaults) {
  let defined = window.localStorage.getItem(setting);
  if(defined == null) {
    window.localStorage.setItem(setting, JSON.stringify(defaults[setting]));
    continue;
  }

  defined = JSON.parse(defined);
  let changed = false;
  for(atr in defaults[setting]) {
    if(defined[atr] == undefined) {
      defined[atr] = defaults[setting][atr];
      changed = true;
    }
  }

  if(changed) {
    window.localStorage.setItem(setting, JSON.stringify(defined));
  }
}

setTimeout(() => {
  window.location.href = 'index.html';
}, 3000);
