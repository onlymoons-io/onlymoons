const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const tokenFaucet = await deploy("Faucet", {
    from: deployer,
    log: true,
    args: [
      // address token
      "0x61eCcF50a459B11f2609BceC009481F4Dcbb8247",
      // uint256 claimAmount
      ethers.utils.parseUnits("1000", 18),
      // uint256 claimCooldown
      86400,
    ],
  });

  const lpFaucet = await deploy("Faucet", {
    from: deployer,
    log: true,
    args: [
      // address token
      "0xaf4e2aea66A66CC56a124e45835767D4749B9404",
      // uint256 claimAmount
      ethers.utils.parseUnits("50", 18),
      // uint256 claimCooldown
      86400,
    ],
  });
};

module.exports.tags = ["OnlyMoons", "Faucet"];
