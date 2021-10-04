if(cmpVersions("2.1.0", window.localStorage.getItem('versionLastSeen'))) {
  //prepare data object for multi-crypto format
  window.localStorage.setItem('data', JSON.stringify(defaults.data));

  //prepare assessmentData object for multi-crypto format
  window.localStorage.setItem('assessmentData', JSON.stringify(defaults.assessmentData));

  //add crypto & currency fields to investments
  const invs = getInvestments();
  for(const i in invs) {
    if(invs[i].crypto == undefined)
      invs[i].crypto = 'BTC';
    if(invs[i].currency == undefined)
      invs[i].currency = getSettings().currency;
  }
  saveInvestments(invs);
}
