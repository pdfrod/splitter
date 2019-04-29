const BN = web3.utils.BN;


function assertBigNumEq(actual, expected) {
  assert.isTrue(actual.eq(expected), `expected ${actual} to equal ${expected}`);
}


async function assertException(promise, reason) {
  let error = null;
  try {
    await promise;
  } catch (e) {
    error = e;
  }
  assert.exists(error);
  assert.equal(error.reason, reason);
}


async function getBalance(account) {
  return new BN(await web3.eth.getBalance(account));
}


function getBalances(accounts) {
  return Promise.all(accounts.map(getBalance));
}


module.exports = { assertBigNumEq, assertException, getBalance, getBalances };
