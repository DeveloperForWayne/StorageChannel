const ethers = require('ethers');

async function getSignature(privateKey, message) {
    
    let wallet = new ethers.Wallet(privateKey);

    let flatSig = await wallet.signMessage(message);
    let sig = ethers.utils.splitSignature(flatSig);
  
    return sig;
}

module.exports = {
    getSignature
}