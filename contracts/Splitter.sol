pragma solidity 0.5.0;

contract Splitter {
  bool private isRunning = true;
  address private owner;
  uint constant private PEOPLE_COUNT = 2;
  address payable[PEOPLE_COUNT] private addresses;
  mapping(address => uint) private balances;

  event LogReceiveEther(uint value);
  event LogWithdraw(address indexed requester);
  event LogPauseContract(address indexed sender);
  event LogResumeContract(address indexed sender);

  modifier onlyOwner {
    require(msg.sender == owner, "Unauthorized");
    _;
  }

  modifier onlyIfRunning {
    require(isRunning);
    _;
  }

  // Receives an array with the addresses of Bob and Carol
  constructor(address payable[PEOPLE_COUNT] memory _addresses) public {
    owner = msg.sender;
    addresses = _addresses;
  }

  // Returns person's current balance.
  function getBalance(address payable account) public view returns (uint) {
    return balances[account];
  }

  // Splits the received ether into Bob and Carol's account.
  function() external payable onlyOwner onlyIfRunning {
    require(msg.value % 2 == 0, "Only even values accepted");
    uint splitValue = msg.value / 2;
    for (uint i = 0; i < addresses.length; i++) {
      address payable account = addresses[i];
      balances[account] = add(balances[account], splitValue);
    }
    emit LogReceiveEther(msg.value);
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

  function pauseContract() public onlyOwner onlyIfRunning {
    isRunning = false;
    emit LogPauseContract(msg.sender);
  }

  function resumeContract() public onlyOwner {
    require(!isRunning);
    isRunning = true;
    emit LogResumeContract(msg.sender);
  }

  function add(uint a, uint b) internal pure returns (uint) {
    uint result = a + b;
    // Just in case somebody gets filthy rich
    assert(result >= a && result >= b);
    return result;
  }
}
