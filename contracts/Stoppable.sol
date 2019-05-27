pragma solidity 0.5.0;

import "./Owned.sol";

contract Stoppable is Owned {
  bool private isRunning = true;

  event LogPauseContract(address indexed sender);
  event LogResumeContract(address indexed sender);

  modifier onlyIfRunning {
    require(isRunning);
    _;
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
}
