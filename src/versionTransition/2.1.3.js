if(cmpVersions("2.1.3", getVersionLastSeen())) {
  setActiveCrypto({
    name: JSON.parse(window.localStorage.getItem('activeCrypto')),
    lastChanged: 0,
    paused: false
  })
}
