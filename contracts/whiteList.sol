pragma solidity ^0.5.0;


contract whiteList {
	
    event WhitelistedAdded(address indexed account);
    event WhitelistedRemoved(address indexed account);

    address public owner;
  
    mapping (address => bool) whitelisteds;

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function addWhitelisted(address account)
        public
        onlyOwner
    {
        whitelisteds[account] = true;
        emit WhitelistedAdded(account);
    }

    function getWhitelisted(address account) public view returns (bool)
    {
        return whitelisteds[account];
    }

    function removeWhitelisted(address account)
        public
        onlyOwner
    {
        whitelisteds[account] = false;
        emit WhitelistedRemoved(account);
    }

}
