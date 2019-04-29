pragma solidity 0.5.0;

contract Splitter {
  enum Person { Alice, Bob, Carol }

  uint constant private PEOPLE_COUNT = 3;
  Person constant private owner = Person.Alice;
  address payable[PEOPLE_COUNT] private addresses;

  event LogSendMoney(address indexed sender, uint value);

  constructor(address payable[PEOPLE_COUNT] memory _addresses) public {
    addresses = _addresses;
  }

  function sendMoney() public payable {
    require(msg.sender == addresses[uint(Person.Alice)], "Unauthorized");
    require(msg.value % 2 == 0, "Only even values accepted");
    uint value = msg.value / 2;
    addresses[uint(Person.Bob)].transfer(value);
    addresses[uint(Person.Carol)].transfer(value);
    emit LogSendMoney(msg.sender, msg.value);
  }

  function getBalance(Person person) public view returns (uint) {
    return addresses[uint(person)].balance;
  }
}
