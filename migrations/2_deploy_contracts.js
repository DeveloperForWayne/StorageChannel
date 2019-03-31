const cloudStorage = artifacts.require("cloudStorage");
const whiteList = artifacts.require("whiteList");
const channel = artifacts.require("Channel");

module.exports = async(deployer) => {
  await deployer.deploy(whiteList);
  await deployer.deploy(channel);
  await deployer.deploy(cloudStorage, whiteList.address, channel.address);
};