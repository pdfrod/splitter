const Splitter = artifacts.require('Splitter');
const BN = web3.utils.BN;
const truffleAssert = require('truffle-assertions');
const {
  assertBigNumEq,
  getBalance,
} = require('./util');

const BOB = 0;
const CAROL = 1;


contract('Splitter', function(allAccounts) {
  const [aliceAddress, bobAddress, carolAddress] = allAccounts;
  const accounts = [bobAddress, carolAddress];
  const initialValue = new BN(30);
  const halfInitialValue = initialValue.div(new BN(2));

  beforeEach(async function() {
    this.splitter = await Splitter.new(accounts, { from: aliceAddress });
    const params = { from: aliceAddress, value: initialValue };
    this.result = await this.splitter.deposit(params);
  });

  describe('sending funds to the contract', function() {
    it('splits the value between Bob and Carol', async function() {
      const balances =
        await Promise.all(accounts.map(a => this.splitter.getBalance(a)));
      assertBigNumEq(balances[BOB], halfInitialValue);
      assertBigNumEq(balances[CAROL], halfInitialValue);
    });

    it('emits a LogDeposit event', async function() {
      truffleAssert.eventEmitted(this.result, 'LogDeposit', (ev) => {
        return ev.value.toString() === initialValue.toString();
      });
    });
  });

  describe('after Carols withdraws from her account', function() {
    beforeEach(async function() {
      this.initialBalance = await getBalance(carolAddress);
      const params = { from: carolAddress, gasPrice: '0' }
      this.result = await this.splitter.withdraw(params);
    });

    it('correctly sends the funds to Carol', async function() {
      const finalBalance = await getBalance(carolAddress);
      const delta = finalBalance.sub(this.initialBalance);
      assertBigNumEq(delta, halfInitialValue);
    });

    it('sets her balance to zero', async function() {
      const balance = await this.splitter.getBalance(carolAddress);
      assertBigNumEq(balance, new BN(0));
    });

    it('emits a LogWithdraw event', async function() {
      truffleAssert.eventEmitted(this.result, 'LogWithdraw');
    });
  });
});
