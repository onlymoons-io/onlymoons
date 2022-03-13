// const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const fundraisingManager = await deploy("FundraisingManager", {
    from: deployer,
    log: true,
    // args: []
  });

  const fundraising = await deploy("Fundraising", {
    from: deployer,
    log: true,
    args: [
      // string memory title,
      "Fundraising",
      // string memory description,
      "Fundraising",
      // uint40 endsAt,
      99999999999,
      // uint256 successThreshold
      0,
    ],
  });
};

module.exports.tags = ["OnlyMoons", "Fundraising"];
