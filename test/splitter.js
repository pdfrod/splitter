const Splitter = artifacts.require('Splitter');
const BN = web3.utils.BN;
const truffleAssert = require('truffle-assertions');
const {
  assertBigNumEq,
  authTest,
  eventTest,
  getBalances
} = require('./util');

const ALICE = 0;
const BOB = 1;
const CAROL = 2;
const PEOPLE = ['Alice', 'Bob', 'Carol'];


contract('Splitter', function(accounts) {
  describe('fallback function', function() {
    authTest(null, { from: accounts[CAROL], value: 10 });

    eventTest('LogSendMoney', null, { from: accounts[ALICE], value: 50 });

    it('rejects values that are not even', async function() {
      const REASON = 'Only even values accepted';
      const splitter = await Splitter.deployed();
      const params = { from: accounts[ALICE], value: 3 };
      await truffleAssert.fails(
        splitter.sendTransaction(params),
        truffleAssert.ErrorType.REVERT,
        REASON
      );
    });
  });


  describe('split', function() {
    authTest('split', { from: accounts[BOB] });

    eventTest('LogSplit', 'split', { from: accounts[ALICE] });
  });


  describe('settle', function() {
    authTest('settle', { from: accounts[BOB] });

    eventTest('LogSettle', 'settle', { from: accounts[ALICE] });
  });


  describe('is interacted by Alice', function() {
    const initialValue = new BN(30);
    const splitValue = initialValue.div(new BN(2));

    beforeEach(async function() {
      this.splitter = await Splitter.new(accounts);
      await this.splitter.sendTransaction({ from: accounts[ALICE], initialValue });
    });

    it("deposits the received ether into Alice's account", async function() {
      const balance = await this.splitter.getBalance(ALICE);
      assertBigNumEq(balance, initialValue);
    });

    it("splits Alice's ether between Bob and Carol", async function() {
      await this.splitter.split.sendTransaction();
      const balances =
        await Promise.all(PEOPLE.map((p, i) => this.splitter.getBalance(i)));

      // Alice account should be zero - her ether was split by Bob and Carol
      assertBigNumEq(balances[ALICE], new BN(0));
      assertBigNumEq(balances[BOB], splitValue);
      assertBigNumEq(balances[CAROL], splitValue);

      // The total contract value should remain the same
      const total = await this.splitter.getTotalBalance();
      assertBigNumEq(total, initialValue);
    });

    it('settles the accounts to the blockchain', async function() {
      await this.splitter.split.sendTransaction();
      const params = { from: accounts[ALICE], initialValue };
      await this.splitter.sendTransaction(params);
      const initialBalances = await getBalances(accounts);
      await this.splitter.settle.sendTransaction({ gasPrice: '0' });
      const finalBalances = await getBalances(accounts);

      // Alice should also receive ether, since we sent more ether into the contract
      // after the split operaton was performed
      assertBigNumEq(finalBalances[ALICE], initialBalances[ALICE].add(initialValue));
      assertBigNumEq(finalBalances[BOB], initialBalances[BOB].add(splitValue));
      assertBigNumEq(finalBalances[CAROL], initialBalances[CAROL].add(splitValue));

      // After settlement, the contract should now be at zero
      const total = await this.splitter.getTotalBalance();
      assertBigNumEq(total, new BN(0));
    });
  });
});
