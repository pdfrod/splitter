const BN = web3.utils.BN;


function assertBigNumEq(actual, expected) {
  assert.strictEqual(actual.toString(10), expected.toString(10));
}


async function getBalance(account) {
  return new BN(await web3.eth.getBalance(account));
}


async function getTransactionCost(txResult) {
  const transaction = await web3.eth.getTransaction(txResult.tx);
  const gasUsed = new BN(txResult.receipt.gasUsed);
  return new BN(transaction.gasPrice).mul(gasUsed);
}


module.exports = { assertBigNumEq, getBalance, getTransactionCost };
