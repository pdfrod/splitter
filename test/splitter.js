const Splitter = artifacts.require('Splitter');
const { BN, toWei } = web3.utils;
const truffleAssert = require('truffle-assertions');
const {
  assertBigNumEq,
  getBalance,
  getTransactionCost
} = require('./util');
const given = require('given2');

const BOB_INDEX = 0;
const CAROL_INDEX = 1;


contract('Splitter', function(allAccounts) {
  const [aliceAddress, bobAddress, carolAddress] = allAccounts;
  const accounts = [bobAddress, carolAddress];
  let splitter;

  beforeEach('create a new contract', async function() {
    splitter = await Splitter.new({ from: aliceAddress });
  });

  describe('deposit', function() {
    given('depositPromise', () =>
      splitter.deposit(accounts, { from: aliceAddress,
                                   value: given.initialValue }));

    describe('when called with an odd value', function() {
      given('initialValue', () => new BN(100005));

      it('fails', async function() {
        await truffleAssert.fails(
          given.depositPromise,
          truffleAssert.ErrorType.REVERT,
          'The deposited amount is not evenly divisible between the recipients'
        );
      });
    });

    describe('when called with an even value', function() {
      given('initialValue', () => new BN(100000));

      it('splits the value between Bob and Carol', async function() {
        await given.depositPromise;
        const balances =
          await Promise.all(accounts.map(a => splitter.getBalance(a)));
        const halfInitialValue = given.initialValue.div(new BN(2));
        assertBigNumEq(balances[BOB_INDEX], halfInitialValue);
        assertBigNumEq(balances[CAROL_INDEX], halfInitialValue);
      });

      it('emits a LogDeposit event', async function() {
        const result = await given.depositPromise;
        truffleAssert.eventEmitted(result, 'LogDeposit', (ev) => {
          return ev.value.toString() === given.initialValue.toString();
        });
      });
    });
  });

  describe('withdraw', function() {
    given('withdrawPromise', () => splitter.withdraw({ from: carolAddress }));

    describe('when the balance is zero', function() {
      it('fails', async function() {
        await truffleAssert.fails(
          given.withdrawPromise,
          truffleAssert.ErrorType.REVERT,
          'Nothing to withdraw'
        );
      });
    });

    describe('when the balance is nonzero', function() {
      const initialValue = new BN(toWei('1', 'gwei'));

      beforeEach('deposit funds to the contract', async function() {
        const params = { from: aliceAddress, value: initialValue };
        await splitter.deposit(accounts, params);
      });

      it('sends the funds to Carol', async function() {
        initialBalance = await getBalance(carolAddress);
        const result = await given.withdrawPromise;
        const finalBalance = await getBalance(carolAddress);
        const transactionCost = await getTransactionCost(result);
        const halfInitialValue = initialValue.div(new BN(2));
        const expectedBalance =
          initialBalance.add(halfInitialValue).sub(transactionCost);
        assertBigNumEq(finalBalance, expectedBalance);
      });

      it('sets her balance to zero', async function() {
        await given.withdrawPromise;
        const balance = await splitter.getBalance(carolAddress);
        assertBigNumEq(balance, new BN(0));
      });

      it('emits a LogWithdraw event', async function() {
        const result = await given.withdrawPromise;
        truffleAssert.eventEmitted(result, 'LogWithdraw');
      });
    })
  });
});
