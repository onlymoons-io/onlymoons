// const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, get, execute } = deployments;
  const { deployer } = await getNamedAccounts();

  const [utilLibrary, utilV2Library, fees] = await Promise.all([
    get("Util"),
    get("UtilV2"),
    get("Fees"),
  ]);

  await deploy("TokenLockerUniV2", {
    from: deployer,
    args: [],
    log: true,
    libraries: {
      Util: utilLibrary.address,
    },
  });

  await execute(
    // contract name
    "TokenLockerUniV2",
    // TxOptions
    {
      from: deployer,
      log: true,
    },
    "setFeesContract",
    fees.address
  );

  await deploy("TokenLockerUniV3", {
    from: deployer,
    args: [],
    log: true,
    libraries: {
      UtilV2: utilV2Library.address,
    },
  });

  await execute(
    // contract name
    "TokenLockerUniV3",
    // TxOptions
    {
      from: deployer,
      log: true,
    },
    "setFeesContract",
    fees.address
  );
};

module.exports.tags = ["OnlyMoons", "LP Locker"];
