pragma solidity 0.5.0;

contract Owned {
  address private owner;

  modifier onlyOwner {
    require(msg.sender == owner, "Unauthorized");
    _;
  }

  constructor() public {
    owner = msg.sender;
  }
}
