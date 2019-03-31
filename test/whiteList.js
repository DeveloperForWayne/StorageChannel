const whiteList = artifacts.require("whiteList");
const { expectEvent, shouldFail } = require('openzeppelin-test-helpers');

const mode = process.env.MODE;

let whiteListInstance;


contract("WhiteList", accounts => {
  
  beforeEach(async function() {
    whiteListInstance = await whiteList.new();
  });  

  after("write coverage/profiler output", async () => {
    if (mode === "profile") {
      await global.profilerSubprovider.writeProfilerOutputAsync();
    } else if (mode === "coverage") {
      await global.coverageSubprovider.writeCoverageAsync();
    }
  });

  it("Should have owner address be same address who deployed contract", async () => {
    const owner = accounts[0];

    assert.equal(
      (await whiteListInstance.owner()),
      owner
    );
  });

  it("Should allow owner to add whitelist", async function () {
    const newUser = accounts[1];

    let result = await whiteListInstance.addWhitelisted(newUser);

    assert.equal(
    (await whiteListInstance.getWhitelisted(newUser)),
    true,
    "Fail to add user to whitelist."
    );

    assert.equal(result.logs[0].args.account,newUser,'Fail to add new user to whitelist');

  });

  it("Should not allow non-owner to add whitelist", async function () {
    const newUser = accounts[1];
    const cUser = accounts[2];

    await shouldFail.reverting(whiteListInstance.addWhitelisted(newUser, { from: cUser }));

  });

  it("Should allow owner to remove whitelist", async function () {
    const newUser = accounts[1];

    await whiteListInstance.addWhitelisted(newUser);
    let result = await whiteListInstance.removeWhitelisted(newUser);

    assert.equal(
    (await whiteListInstance.getWhitelisted(newUser)),
    false,
    "Fail to remove user from whitelist."
    );

    assert.equal(result.logs[0].args.account,newUser,'Fail to remove new user in whitelist');

  });
  
  it("Should not allow non-owner to remove whitelist", async function () {
    const newUser = accounts[1];
    const cUser = accounts[2];
    
    result = await whiteListInstance.addWhitelisted(newUser);
    await shouldFail.reverting(whiteListInstance.removeWhitelisted(newUser, { from: cUser }));

  });

  it("Should allow whitelist to get file", async function () {
    const newUser = accounts[1];

    await whiteListInstance.addWhitelisted(newUser);

    assert.equal(
    (await whiteListInstance.getWhitelisted(newUser)),
    true,
    "Fail to get whitelist."
    );  
  });

 });