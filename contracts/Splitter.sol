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

  constructor(address payable[PEOPLE_COUNT] memory _addresses) public {
    addresses = _addresses;
  }

  function getBalance(Person person) public view returns (uint) {
  }

  function getTotalBalance() public view returns (uint) {
  }

  function() external payable {
  }

  function split() public returns (uint) {
  }

  function settle() public returns (uint) {
  }
}
