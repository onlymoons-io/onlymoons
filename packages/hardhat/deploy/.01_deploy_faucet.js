const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const faucet = await deploy("Faucet", {
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
};
