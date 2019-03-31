pragma solidity ^0.5.0;


contract Channel {
    struct FileChannel {
        address sender;
        address receiver;
    }

    mapping (bytes32 => FileChannel) public channels;

    bytes public ipfsHash;

    function openChannel(bytes32 _channelId, address _sender, address _receiver) public {
        channels[_channelId] = FileChannel(_sender, _receiver);
    }

    function verifySignature(uint8 v, bytes32 r, bytes32 s, bytes32 message) public pure returns (address) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 msgHash = keccak256(abi.encodePacked(prefix, message));
        return ecrecover(msgHash, v, r, s);
    }
    
    function closeChannel(bytes32 _channelId, bytes32 message, uint8 v, bytes32 r, bytes32 s) public {
        require(channels[_channelId].sender == verifySignature(v, r, s, message), "address not equal");
        delete channels[_channelId];
    }

}
