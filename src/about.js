const settings = getSettings();
document.body.style.filter += ' brightness(' + settings.brightness.toFixed(2) + ')';

const version = document.getElementById('version');
version.innerText = 'v '+getVersion();
