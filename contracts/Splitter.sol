pragma solidity 0.5.0;

contract Splitter {
  enum Person { Alice, Bob, Carol }
  uint constant private PEOPLE_COUNT = 3;
  Person constant private owner = Person.Alice;
  address[PEOPLE_COUNT] private addresses;

  constructor(address[PEOPLE_COUNT] memory _addresses) public {
    addresses = _addresses;
  }

  function sendMoney() public payable {
  }

  function getBalance(Person person) public view returns (uint) {
  }
}
