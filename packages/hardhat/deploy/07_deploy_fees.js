// const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  /* const fees = */ await deploy("Fees", {
    from: deployer,
    log: true,
    args: [
      // address payable treasuryFeeAddress_
      deployer,
      // address payable stakingFeeAddress_
      // change this after deploying staking
      deployer,
    ],
  });
};

module.exports.tags = ["OnlyMoons", "Fees"];
