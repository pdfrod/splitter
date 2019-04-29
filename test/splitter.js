const Splitter = artifacts.require('Splitter');
const BN = web3.utils.BN;

const ALICE = 0;
const BOB = 1;
const PEOPLE = ['Alice', 'Bob', 'Carol'];


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


contract('Splitter', function(accounts) {
  let initialBalances;

  beforeEach(function() {
    return Promise.all(accounts.map(account => web3.eth.getBalance(account)))
      .then(function(balances) {
        initialBalances = balances.map(balance => new BN(balance));
      });
  });

  describe('getBalance', function() {
    for (let i = 0; i < PEOPLE.length; i++) {
      const name = PEOPLE[i];

      it(`gets ${name}'s balance`, async function() {
        const splitter = await Splitter.deployed();
        const initial = initialBalances[i];
        const balance = new BN(await splitter.getBalance.call(i));
        assert.isTrue(balance.eq(initialBalances[i]),
                      `expected ${balance} to equal ${initial}`);
      });
    }
  });

  describe('sendMoney', function() {
    it('splits sent money by Bob and Carol', async function() {
      const splitter = await Splitter.deployed();
      const value = 10;
      const params = { from: accounts[ALICE], value };
      await splitter.sendMoney.sendTransaction(params);

      for (let i = 1; i < PEOPLE.length; i++) {
        const expected = initialBalances[i].add(new BN(value / 2));
        const balance = new BN(await web3.eth.getBalance(accounts[i]));
        assert.isTrue(balance.eq(expected),
                      `expected ${balance} to equal ${expected}`);
      }
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
