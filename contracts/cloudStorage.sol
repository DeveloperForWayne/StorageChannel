pragma solidity ^0.5.0;
import "./whiteList.sol";
import "./channel.sol";

contract cloudStorage {
	
    event FileAdded(bytes fileName, bytes ipfsHash);
    event FileRemoved(bytes fileName);

    address public owner;

    mapping(bytes => bytes) File;
    
    whiteList _whiteList;

    Channel _channel;

    constructor(address _wl, address _ch) public {
        owner = msg.sender;
        _whiteList = whiteList(_wl);
        _channel = Channel(_ch);
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function addOrUpdateFile(bytes memory _FileName, bytes memory _ipfsHash) 
		public 
		onlyOwner
	{
        File[_FileName] = _ipfsHash;
        emit FileAdded(_FileName, _ipfsHash);
    }

    function removeFile(bytes memory _FileName) 
		public
		onlyOwner
	{
        delete File[_FileName];
        emit FileRemoved(_FileName);
    }

    function getFile(bytes memory _FileName) public view returns (bytes memory)  {
        require(msg.sender == owner || _whiteList.getWhitelisted(msg.sender));
        return File[_FileName];
    }

    function _openChannel(bytes32 _channelId, address _sender, address _receiver, bytes memory _ipfsHash)
        public
        onlyOwner
    {
        _channel.openChannel(_channelId, _sender, _receiver, _ipfsHash);
    }

    function _closeChannel(bytes memory _fileName, bytes32 _channelId, bytes memory _ipfshash, bytes32 msgHash, uint8 v, bytes32 r, bytes32 s)
        public
        onlyOwner
    {
        _channel.closeChannel(_channelId, msgHash, v, r, s);
        addOrUpdateFile(_fileName, _ipfshash);
    }
}
