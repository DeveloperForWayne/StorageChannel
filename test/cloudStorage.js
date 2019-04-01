const cloudStorage = artifacts.require("cloudStorage");
const whiteList = artifacts.require("whiteList");
const channel = artifacts.require("Channel");
const ethers = require('ethers');
const getSign = require("./getSign.js");
const { expectEvent, shouldFail } = require('openzeppelin-test-helpers');
const ipfsHash1 = ethers.utils.id('QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz');
const ipfsHash2 = ethers.utils.id('QmT9qk3CRYbFDWpDFYeAv8T8H1gnongwKhh5J68NLkLir6');
const fName = ethers.utils.id('testFile');
const privateKey = "0xc2476e3baed6a3182afba5bb8b2b2b68ac9e3149a2acc98b2118da7d944bf49c";
const mode = process.env.MODE;

let cloudStorageInstance;


contract("Cloud Storage", accounts => {
  
  beforeEach(async function() {
    whiteListInstance = await whiteList.new();
    channelInstance = await channel.new();
    cloudStorageInstance = await cloudStorage.new(whiteListInstance.address, channelInstance.address);
  });  

  after("write coverage/profiler output", async () => {
    if (mode === "profile") {
      await global.profilerSubprovider.writeProfilerOutputAsync();
    } else if (mode === "coverage") {
      await global.coverageSubprovider.writeCoverageAsync();
    }
  });

  it("Should allow owner to update file", async function () {

    await cloudStorageInstance.addOrUpdateFile(fName, ipfsHash1);
    let result = await cloudStorageInstance.addOrUpdateFile(fName, ipfsHash2);
    
    assert.equal(
    (await cloudStorageInstance.getFile(fName)),
    ipfsHash2,
    "File is not restored in the correct place."
    );

    assert.equal(result.logs[0].args.fileName,fName,'file name is incorrect');
    assert.equal(result.logs[0].args.ipfsHash,ipfsHash2,'storage ipfs is incorrect');

  });

  it("Should fail if non-owner want to update file", async function () {
    const newOwner = accounts[1];

    await shouldFail.reverting(cloudStorageInstance.addOrUpdateFile(fName, ipfsHash1, { from: newOwner }));

  });
  
  it("Should allow owner to get file", async function () {

    await cloudStorageInstance.addOrUpdateFile(fName, ipfsHash1);

    assert.equal(
    (await cloudStorageInstance.getFile(fName)),
    ipfsHash1,
    "Unable to access file."
    );  
  });

  it("Should allow whitelist to get file", async function () {
    const newUser = accounts[1];

    await cloudStorageInstance.addOrUpdateFile(fName, ipfsHash1);
    
    await whiteListInstance.addWhitelisted(newUser);

    assert.equal(
    (await cloudStorageInstance.getFile(fName, { from: newUser })),
    ipfsHash1,
    "Unable to access file."
    );  
  });

  it("Should fail if non-owner or non-whitelist want to get file", async function () {
    const newUser = accounts[1];

    await cloudStorageInstance.addOrUpdateFile(fName, ipfsHash1);

    await shouldFail.reverting(cloudStorageInstance.getFile(fName, { from: newUser }));

  });

  it("Should allow owner to remove file", async function () {
    const newOwner = accounts[1];
    
    await cloudStorageInstance.addOrUpdateFile(fName, ipfsHash1);
    let result = await cloudStorageInstance.removeFile(fName);
   
    assert.equal(
      (await cloudStorageInstance.getFile(fName)),
      null,
      "File is not deleted correctly."
      );
    
    assert.equal(result.logs[0].args.fileName,fName,'file name is incorrect');

  });

  it("Should fail if non-owner want to remove file", async function () {
    const newOwner = accounts[1];
    
    await cloudStorageInstance.addOrUpdateFile(fName, ipfsHash1);

    await shouldFail.reverting(cloudStorageInstance.removeFile(fName, { from: newOwner }));

  });

  it("Should allow owner to open channel", async function () {
    const sender = accounts[0];
    const receiver = accounts[1];
    const channelId = ethers.utils.formatBytes32String("1");;
    
    await cloudStorageInstance._openChannel(channelId, sender, receiver, ipfsHash1);
      
  });

  it("Should fail if non-owner want to open channel", async function () {
    const sender = accounts[0];
    const receiver = accounts[1];
    const newOwner = accounts[2];
    const channelId = ethers.utils.formatBytes32String("1");;
    
    await shouldFail.reverting(cloudStorageInstance._openChannel(channelId, sender, receiver, ipfsHash1, { from: newOwner }));

  });

  it("Should fail if non-owner want to close channel", async function () {
    const newOwner = accounts[1];
    const channelId = ethers.utils.formatBytes32String("1");
    
    let messageHashBytes = ethers.utils.arrayify(ipfsHash1);
    
    let sig = await getSign.getSignature(privateKey, messageHashBytes);

    await shouldFail.reverting(cloudStorageInstance._closeChannel(fName, channelId, ipfsHash1, ipfsHash1, sig.v, sig.r, sig.s, { from: newOwner }));

  });

  it("Should allow owner to close channel", async function () {
    const sender = accounts[0];
    const receiver = accounts[1];
    const channelId = ethers.utils.formatBytes32String("1");
    
    let messageHashBytes = ethers.utils.arrayify(ipfsHash1);
    
    await cloudStorageInstance._openChannel(channelId, sender, receiver, ipfsHash1);

    let sig = await getSign.getSignature(privateKey, messageHashBytes);
    
    await cloudStorageInstance._closeChannel(fName, channelId, ipfsHash1, ipfsHash1, sig.v, sig.r, sig.s);

    assert.equal(
      (await cloudStorageInstance.getFile(fName)),
      ipfsHash1,
      "Unable to close channel."
    );  

  });

 });