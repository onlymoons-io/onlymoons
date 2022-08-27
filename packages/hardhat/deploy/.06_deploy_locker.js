// const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const [erc20, utilLibrary] = await Promise.all([get("ERC20"), get("Util")]);

  const tokenLockerManagerV1 = await deploy("TokenLockerManagerV1", {
    from: deployer,
    // args: [],
    log: true,
    libraries: {
      Util: utilLibrary.address,
    },
  });

  // NOTE: we don't actually need to deploy this for any reason
  // other than verifying the contract so future instances
  // will automatically be verified on scan sites.
  const tokenLockerV1 = await deploy("TokenLockerV1", {
    from: deployer,
    args: [
      tokenLockerManagerV1.address,
      0,
      deployer,
      erc20.address,
      99999999999,
    ],
    libraries: {
      Util: utilLibrary.address,
    },
    log: true,
  });
};

module.exports.tags = ["OnlyMoons", "Token Locker"];
