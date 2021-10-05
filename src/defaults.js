const defaults = {
  settings: {
    brightness: 1,
    chartsOpacity: 0.05,
    incomeTax: 19,
    buyFee: 2.5,
    sellFee: 2.5,
    hideSensitive: 0,
    sellAssessmentFastidiousness: 0.5,
    currency: 'EUR',
    activeCrypto: ['BTC'],
    switchInterval: 60
  },
  aads: 0,
  investments: [],
  assessmentData: {
    default: {
      refreshPeriod: 0,
      lastComputed: 0,
      maxTime: 0,
      threshold: Infinity,
      sellBuyScore: 0
    }
  },
  data: {},
  btcLeft: 21000000,
  activeCrypto: {
    name: 'BTC',
    lastChanged: 0,
    paused: false
  },
  versionLastSeen: "0.0.0"
}
