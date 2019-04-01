pragma solidity ^0.5.0;

contract Caller {
    cloudStorage cloudS;
    
    constructor(address addr) public {
        cloudS = cloudStorage(addr);
    }

    function UpdateFileAndConfirm(bytes memory fileName, bytes memory ipfsHash) public returns (bytes memory) {
        cloudS.addOrUpdateFile(fileName, ipfsHash);
        return cloudS.getFile(fileName);
    }
}

contract cloudStorage {
    function addOrUpdateFile(bytes memory _fileName, bytes memory _ipfsHash) public;
    function removeFile(bytes memory _fileName) public;
    function getFile(bytes memory _fileName) public view returns (bytes memory);
    function _openChannel(bytes32 _channelId, address _sender, address _receiver, bytes memory _ipfsHash) public;
    function _closeChannel(bytes memory _fileName, bytes32 _channelId, bytes memory _ipfsHash, bytes32 msgHash, uint8 v, bytes32 r, bytes32 s) public;
}