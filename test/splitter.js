const Splitter = artifacts.require('Splitter');
const { BN, toWei } = web3.utils;
const truffleAssert = require('truffle-assertions');
const {
  assertBigNumEq,
  getBalance,
} = require('./util');

const BOB_INDEX = 0;
const CAROL_INDEX = 1;


contract('Splitter', function(allAccounts) {
  const [aliceAddress, bobAddress, carolAddress] = allAccounts;
  const accounts = [bobAddress, carolAddress];
  let initialValue, halfInitialValue, splitter, result;

  beforeEach(async function() {
    splitter = await Splitter.new({ from: aliceAddress });
  });

  describe('depositing an odd value', function() {
    it('fails', async function() {
      initialValue = new BN(100005);
      const params = { from: aliceAddress, value: initialValue };
      await truffleAssert.fails(
        splitter.deposit(accounts, params),
        truffleAssert.ErrorType.REVERT,
        "The deposited amount is not evenly divisible between the recipients"
      );
    });
  });

  describe('sending funds to the contract', function() {
    beforeEach(async function() {
      initialValue = new BN(toWei('1', 'gwei'));
      halfInitialValue = initialValue.div(new BN(2));
      const params = { from: aliceAddress, value: initialValue };
      result = await splitter.deposit(accounts, params);
    });

    it('splits the value between Bob and Carol', async function() {
      const balances =
        await Promise.all(accounts.map(a => splitter.getBalance(a)));
      assertBigNumEq(balances[BOB_INDEX], halfInitialValue);
      assertBigNumEq(balances[CAROL_INDEX], halfInitialValue);
    });

    it('emits a LogDeposit event', async function() {
      truffleAssert.eventEmitted(result, 'LogDeposit', (ev) => {
        return ev.value.toString() === initialValue.toString();
      });
    });
  });

  describe('after Carols withdraws from her account', function() {
    let initialBalance;

    beforeEach(async function() {
      initialValue = new BN(toWei('1', 'gwei'));
      halfInitialValue = initialValue.div(new BN(2));
      const params = { from: aliceAddress, value: initialValue };
      await splitter.deposit(accounts, params);
      initialBalance = await getBalance(carolAddress);
      result = await splitter.withdraw({ from: carolAddress });
    });

    it('correctly sends the funds to Carol', async function() {
      const finalBalance = await getBalance(carolAddress);
      const transaction = await web3.eth.getTransaction(result.tx);
      const gasUsed = new BN(result.receipt.gasUsed);
      const transactionCost = new BN(transaction.gasPrice).mul(gasUsed);
      const expectedBalance =
        initialBalance.add(halfInitialValue).sub(transactionCost);
      assertBigNumEq(finalBalance, expectedBalance);
    });

    it('sets her balance to zero', async function() {
      const balance = await splitter.getBalance(carolAddress);
      assertBigNumEq(balance, new BN(0));
    });

    it('emits a LogWithdraw event', async function() {
      truffleAssert.eventEmitted(result, 'LogWithdraw');
    });
  });
});
