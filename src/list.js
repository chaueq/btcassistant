document.getElementById('btnAddInv').addEventListener('click', displayInvForm);
document.getElementById('cancelButton').addEventListener('click', () => {
 document.getElementById('invForm').classList.add('hidden');
});
document.getElementById('addButton').addEventListener('click', () => {
  addInv(
    document.getElementById('date').value,
    document.getElementById('amount').value,
    document.getElementById('boughtFor').value
  );
  window.location.reload(false);
});

const invs = getInvestments();
for(var i = 0; i < invs.length; ++i) {
  appendListElement(invs[i], i);
}
