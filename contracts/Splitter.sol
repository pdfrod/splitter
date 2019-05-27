pragma solidity 0.5.0;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import "./Stoppable.sol";

contract Splitter is Stoppable {
  using SafeMath for uint;
  uint constant private PEOPLE_COUNT = 2;
  address payable[PEOPLE_COUNT] private addresses;
  mapping(address => uint) private balances;

  event LogDeposit(address indexed sender, uint value);
  event LogWithdraw(address indexed requester);

  // Receives an array with the addresses of Bob and Carol
  constructor(address payable[PEOPLE_COUNT] memory _addresses) public {
    addresses = _addresses;
  }

  // Returns person's current balance.
  function getBalance(address account) public view returns (uint) {
    return balances[account];
  }

  // Splits the received ether into Bob and Carol's account.
  function deposit() external payable onlyOwner onlyIfRunning {
    require(msg.value % 2 == 0, "Only even values accepted");
    uint splitValue = msg.value / 2;
    for (uint i = 0; i < addresses.length; i++) {
      address payable account = addresses[i];
      balances[account] = balances[account].add(splitValue);
    }
    emit LogDeposit(msg.sender, msg.value);
  }

  // Allows a person to withdraw their funds from the contract
  function withdraw() public returns (uint) {
    uint value = balances[msg.sender];
    require(value > 0, "Nothing to withdraw");
    balances[msg.sender] = 0;
    msg.sender.transfer(value);
    emit LogWithdraw(msg.sender);
    return value;
  }
}
