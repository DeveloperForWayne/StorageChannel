const channel = artifacts.require("Channel");
const ethers = require('ethers');
const getSign = require("./getSign.js");
const { expectEvent, shouldFail } = require('openzeppelin-test-helpers');
const ipfsHash = "QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz";
const privateKey = "0xc2476e3baed6a3182afba5bb8b2b2b68ac9e3149a2acc98b2118da7d944bf49c";
const mode = process.env.MODE;

let channelInstance;

contract("State Channel", accounts => {
  
  beforeEach(async function() {
    channelInstance = await channel.new();
  });  

  after("write coverage/profiler output", async () => {
    if (mode === "profile") {
      await global.profilerSubprovider.writeProfilerOutputAsync();
    } else if (mode === "coverage") {
      await global.coverageSubprovider.writeCoverageAsync();
    }
  });

  it("Should get same address", async () => {

    const owner = accounts[0];

    let ipfsBytes = ethers.utils.id(ipfsHash);
    let messageHashBytes = ethers.utils.arrayify(ipfsBytes);

    let sig = await getSign.getSignature(privateKey, messageHashBytes);

    assert.equal(
      (await channelInstance.verifySignature(sig.v, sig.r, sig.s, ipfsBytes)),
      owner,
      "message is not equal"
    );
  });

  it("Should allow sender to close channel if the address is same", async function () {
    const sender = accounts[0];
    const receiver = accounts[1];
    const channelID = ethers.utils.formatBytes32String("1");

    await channelInstance.openChannel(channelID, sender, receiver);

    let ipfsBytes = ethers.utils.id(ipfsHash);
    let messageHashBytes = ethers.utils.arrayify(ipfsBytes);
    
    let sig = await getSign.getSignature(privateKey, messageHashBytes);

    await channelInstance.closeChannel(channelID, ipfsBytes, sig.v, sig.r, sig.s)
    // assert.equal(
    // channelInstance.channels[channelID],
    // null,
    // "Unable to close channel."
    // );  
  });
});