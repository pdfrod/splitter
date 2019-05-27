const Splitter = artifacts.require('Splitter');
const BN = web3.utils.BN;
const truffleAssert = require('truffle-assertions');


function assertBigNumEq(actual, expected) {
  assert.strictEqual(actual.toString(10), expected.toString(10));
}


async function getBalance(account) {
  return new BN(await web3.eth.getBalance(account));
}


module.exports = { assertBigNumEq, getBalance };
