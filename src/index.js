const invs = getInvestments();
for(var i = 0; i < invs.length; ++i) {
  appendInv(invs[i].date, invs[i].amount, invs[i].boughtFor);
}
// appendInv('04-07-2021', 0.00078409, 105.18);
// appendInv('08-07-2021', 0.00034542, 45.46);
appendInvTotal();

updateAll();
var priceUpdater = setInterval(updateAll, 15000);
