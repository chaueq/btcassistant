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

async function checkAppUpdate() {
  const latestURL = 'https://github.com/chaueq/btcassistant/releases/latest';
  let response = await fetch(latestURL);
  if(response.ok) {
    let version = response.url.split('/')[7];
    version = version.substr(1, version.length - 1);

    if(cmpVersions(version, getVersion())) {
      document.getElementById('remindLaterBtn').addEventListener('click', () => {
        window.location.href = 'index.html';
      });
      document.getElementById('updateNowBtn').addEventListener('click', () => {
        window.location.href = latestURL;
      });
      document.getElementById('updateNotif').classList.remove('hidden');
    }
  }
}

Promise.all([
  sleep(3000),
  checkAppUpdate()
]).then(() => {
  if(document.getElementById('updateNotif').classList.contains('hidden')) {
      window.location.href = 'index.html';
    console.log('view would be changed now')
  }
})
