pragma solidity 0.5.0;

contract Splitter {
  enum Person { Alice, Bob, Carol }

  uint constant private PEOPLE_COUNT = 3;
  Person constant private owner = Person.Alice;
  address payable[PEOPLE_COUNT] private addresses;
  uint[PEOPLE_COUNT] private balances;

  event LogReceiveEther(uint value);
  event LogSplit(uint value);
  event LogSettle(uint value);

  // Receives an array with the addresses of Alice, Bob and Carol
  constructor(address payable[PEOPLE_COUNT] memory _addresses) public {
    addresses = _addresses;
  }

  // Returns person's current balance.
  function getBalance(Person person) public view returns (uint) {
    return balances[uint(person)];
  }

  // Returns the total amount of ether existing in the contract at the moment.
  // It should be the same as summing the result of calling getBalance()
  // with each of Alice, Bob and Carol.
  function getTotalBalance() public view returns (uint) {
    return address(this).balance;
  }

  // Sets the received ether into Alice's account.
  function() external payable onlyAlice {
    require(msg.value % 2 == 0, "Only even values accepted");
    uint alice = uint(Person.Alice);
    balances[alice] = add(balances[alice], msg.value);
    emit LogReceiveEther(msg.value);
  }

  // Splits all of Alice's balance (within the contract) between Bob and Carol.
  // Returns the amount of ether that existed in Alice's account.
  function split() public onlyAlice returns (uint) {
    uint value = balances[uint(Person.Alice)];
    uint splitValue = value / 2;

    for (uint i = 0; i < balances.length; i++) {
      if (i == uint(Person.Alice)) {
        balances[i] = 0;
      } else {
        balances[i] = add(balances[i], splitValue);
      }
    }

    emit LogSplit(value);
    return value;
  }

  // Settles everyone's balances to the blockchain, leaving everyone's balance
  // within the contract at zero.
  // Returns the total amount of ether that existed in the contract.
  function settle() public onlyAlice returns (uint) {
    uint total = 0;
    uint[PEOPLE_COUNT] memory _balances = balances;

    // Update contract state first, to avoid reentrancy problems
    for (uint i = 0; i < balances.length; i++) {
      balances[i] = 0;
    }

    for (uint i = 0; i < _balances.length; i++) {
      uint value = _balances[i];
      total = add(total, value);
      addresses[i].transfer(value);
    }

    emit LogSettle(total);
    return total;
  }

  function kill() public onlyAlice {
    selfdestruct(msg.sender);
  }

  function add(uint a, uint b) internal pure returns (uint) {
    uint result = a + b;
    // Just in case somebody gets filthy rich
    assert(result >= a && result >= b);
    return result;
  }

  modifier onlyAlice {
    require(msg.sender == addresses[uint(Person.Alice)], "Unauthorized");
    _;
  }
}
