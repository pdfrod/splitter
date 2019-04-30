const Splitter = artifacts.require('Splitter');
const BN = web3.utils.BN;
const truffleAssert = require('truffle-assertions');


function assertBigNumEq(actual, expected) {
  assert.isTrue(actual.eq(expected), `expected ${actual} to equal ${expected}`);
}


function authTest(fn, params) {
  it('rejects operations not done by Alice', async function() {
    const REASON = 'Unauthorized';
    const splitter = await Splitter.deployed();
    const target = fn ? splitter[fn] : splitter;
    await truffleAssert.fails(
      target.sendTransaction(params),
      truffleAssert.ErrorType.REVERT,
      REASON
    );
  });
}


function eventTest(name, fn, params) {
  it(`fires a ${name} event`, async function() {
    const splitter = await Splitter.deployed();
    const target = fn ? splitter[fn] : splitter;
    const result = await target.sendTransaction(params);
    truffleAssert.eventEmitted(result, name, (ev) => {
      return ev.sender === params.from && ev.value.toNumber() === params.value;
    });
  });
}


async function getBalance(account) {
  return new BN(await web3.eth.getBalance(account));
}


function getBalances(accounts) {
  return Promise.all(accounts.map(getBalance));
}


module.exports = { assertBigNumEq, authTest, eventTest, getBalance, getBalances };
