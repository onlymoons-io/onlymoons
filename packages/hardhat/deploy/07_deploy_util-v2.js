// const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("UtilV2", {
    from: deployer,
    // args: [],
    log: true,
  });
};

module.exports.tags = ["OnlyMoons", "Util"];
