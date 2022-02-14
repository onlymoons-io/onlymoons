// const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, get, execute } = deployments;
  const { deployer } = await getNamedAccounts();

  const [erc20, mathLibrary, safeERC20Library] = await Promise.all([
    get("ERC20"),
    get("Math"),
    get("SafeERC20"),
  ]);

  const splitStakingV1 = await deploy("SplitStakingV1", {
    from: deployer,
    log: true,
    // args: [],
    libraries: {
      Math: mathLibrary.address,
    },
  });

  const fees = await deploy("Fees", {
    from: deployer,
    log: true,
    args: [
      // address payable treasuryFeeAddress_
      deployer,
      // address payable stakingFeeAddress_
      splitStakingV1.address,
    ],
  });

  const stakingFactoryV1 = await deploy("StakingFactoryV1", {
    from: deployer,
    log: true,
    args: [],
  });

  const stakingManagerV1 = await deploy("StakingManagerV1", {
    from: deployer,
    log: true,
    args: [
      // factory address
      stakingFactoryV1.address,
      fees.address,
    ],
    libraries: {
      Math: mathLibrary.address,
    },
  });

  // authorize StakingManagerV1 to use StakingFactoryV1
  await execute(
    // contract name
    "StakingFactoryV1",
    // TxOptions
    {
      from: deployer,
      log: true,
    },
    "authorize",
    stakingManagerV1.address,
    true
  );

  const stakingV1 = await deploy("StakingV1", {
    from: deployer,
    log: true,
    args: [
      // address owner_,
      deployer,
      // address tokenAddress_,
      erc20.address,
      // uint16 lockDurationDays_
      0,
    ],
    libraries: {
      Math: mathLibrary.address,
      SafeERC20: safeERC20Library.address,
    },
  });

  const stakingTokenV1 = await deploy("StakingTokenV1", {
    from: deployer,
    log: true,
    args: [
      // address owner_,
      deployer,
      // address tokenAddress_,
      erc20.address,
      // address rewardsTokenAddress_,
      erc20.address,
      // uint16 lockDurationDays_
      0,
    ],
    libraries: {
      Math: mathLibrary.address,
      SafeERC20: safeERC20Library.address,
    },
  });
};

module.exports.tags = ["OnlyMoons", "Staking", "Fees"];
