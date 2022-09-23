// const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const [utilLibrary, utilV2Library, fees] = await Promise.all([
    get("Util"),
    get("UtilV2"),
    get("Fees"),
  ]);

  await deploy("TokenLockerUniV2", {
    from: deployer,
    args: [fees.address],
    log: true,
    libraries: {
      Util: utilLibrary.address,
    },
  });

  await deploy("TokenLockerUniV3", {
    from: deployer,
    args: [fees.address],
    log: true,
    libraries: {
      UtilV2: utilV2Library.address,
    },
  });
};

module.exports.tags = ["OnlyMoons", "LP Locker", "Uniswap V2"];
