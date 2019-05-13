const Splitter = artifacts.require('Splitter');
const BN = web3.utils.BN;
const truffleAssert = require('truffle-assertions');


function assertBigNumEq(actual, expected) {
  assert.isTrue(actual.eq(expected), `expected ${actual} to equal ${expected}`);
}


async function getBalance(account) {
  return new BN(await web3.eth.getBalance(account));
}


module.exports = { assertBigNumEq, getBalance };
