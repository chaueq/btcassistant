const settings = getSettings();
document.body.style.filter += ' brightness(' + settings.brightness.toFixed(2) + ')';

document.getElementById('btnAddInv').addEventListener('click', displayInvForm);
document.getElementById('btnEditInv').addEventListener('click', displayInvEdit);
document.getElementById('cancelButton').addEventListener('click', () => {
 document.getElementById('invForm').classList.add('hidden');
});
document.getElementById('cancelButton2').addEventListener('click', () => {
 document.getElementById('editInv').classList.add('hidden');
});
document.getElementById('addButton').addEventListener('click', () => {
  addInv(
    document.getElementById('date').value,
    document.getElementById('amount').value,
    document.getElementById('boughtFor').value,
    document.getElementById('currency').value,
    document.getElementById('crypto').value
  );
  window.location.reload(false);
});
document.getElementById('saveButton').addEventListener('click', () => {
  window.localStorage.setItem('investments', document.getElementById('invsJSON').value);
  window.location.reload(false);
});

document.getElementById('date').value = new Date().toISOString().split('T')[0];

const invs = getInvestments();
for(var i = 0; i < invs.length; ++i) {
  appendListElement(invs[i], i);
}
document.getElementById('invsJSON').value = JSON.stringify(invs);
