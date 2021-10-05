if(cmpVersions("2.1.3", getVersionLastSeen())) {
  let current = JSON.parse(window.localStorage.getItem('activeCrypto'));
  if(typeof current == 'string') {
    setActiveCrypto({
      name: current,
      lastChanged: 0,
      paused: false
    });
  }
}
