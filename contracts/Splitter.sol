pragma solidity 0.5.0;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import "./Stoppable.sol";

contract Splitter is Stoppable {
  using SafeMath for uint;

  mapping(address => uint) private balances;

  event LogDeposit(address indexed sender, uint value, address payable[] addresses);
  event LogWithdraw(address indexed requester);

  // Returns person's current balance.
  function getBalance(address account) public view returns (uint) {
    return balances[account];
  }

  // Splits the received ether evenly between addresses passed as argument.
  function deposit(address payable[] calldata addresses) external payable onlyIfRunning {
    uint count = addresses.length;
    require(msg.value % count == 0,
            "The deposited amount is not evenly divisible between the recipients");
    uint splitValue = msg.value / count;
    for (uint i = 0; i < count; i++) {
      address payable account = addresses[i];
      balances[account] = balances[account].add(splitValue);
    }
    emit LogDeposit(msg.sender, msg.value, addresses);
  }

  // Allows a person to withdraw their funds from the contract
  function withdraw() public returns (uint) {
    uint value = balances[msg.sender];
    require(value > 0, "Nothing to withdraw");
    balances[msg.sender] = 0;
    emit LogWithdraw(msg.sender);
    msg.sender.transfer(value);
    return value;
  }
}
