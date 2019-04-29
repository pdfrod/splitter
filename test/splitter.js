const Splitter = artifacts.require('Splitter');
const BN = web3.utils.BN;
const {
  assertBigNumEq,
  assertException,
  getBalance,
  getBalances
} = require('./util');

const ALICE = 0;
const BOB = 1;
const PEOPLE = ['Alice', 'Bob', 'Carol'];


contract('Splitter', function(accounts) {
  describe('getBalance', function() {
    for (let i = 0; i < PEOPLE.length; i++) {
      const name = PEOPLE[i];

      it(`gets ${name}'s balance`, async function() {
        const splitter = await Splitter.deployed();
        const initial = await getBalance(accounts[i]);
        const params = { gasPrice: '0' };
        const balance = new BN(await splitter.getBalance.call(i, params));
        assertBigNumEq(balance, initial);
      });
    }
  });

  describe('sendMoney', function() {
    it('splits sent money by Bob and Carol', async function() {
      const splitter = await Splitter.deployed();
      const initialBalances = await getBalances(accounts);
      const value = 10;
      const params = { from: accounts[ALICE], value };
      await splitter.sendMoney.sendTransaction(params);

      for (let i = 1; i < PEOPLE.length; i++) {
        const expected = initialBalances[i].add(new BN(value / 2));
        const balance = new BN(await web3.eth.getBalance(accounts[i]));
        assertBigNumEq(balance, expected);
      }
    });

    it('fires a LogSendMoney event', async function() {
      const splitter = await Splitter.deployed();
      const params = { from: accounts[ALICE], value: 50 };
      await splitter.sendMoney.sendTransaction(params);
      assert.isTrue(false, 'Not implemented yet');
    });

    it('rejects operations not done by Alice', async function() {
      const REASON = 'Unauthorized';
      const splitter = await Splitter.deployed();
      const params = { from: accounts[BOB] };
      await assertException(splitter.sendMoney.sendTransaction(params), REASON);
    });

    it('rejects values that are not even', async function() {
      const REASON = 'Only even values accepted';
      const splitter = await Splitter.deployed();
      const params = { from: accounts[ALICE], value: 3 };
      await assertException(splitter.sendMoney.sendTransaction(params), REASON);
    });
  });
});
