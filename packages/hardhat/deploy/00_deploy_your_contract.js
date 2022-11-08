// deploy/00_deploy_your_contract.js

// const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  // console.log(await deployments.get("ERC20"));
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // const mathLibrary = await deploy("Math", {
  //   from: deployer,
  //   log: true,
  // });

  // const safeERC20Library = await deploy("SafeERC20", {
  //   from: deployer,
  //   log: true,
  // });

  // const safeMathLibrary = await deploy("SafeMath", {
  //   from: deployer,
  //   log: true,
  // });

  /* const utilLibrary = */ await deploy("Util", {
    from: deployer,
    log: true,
  });

  /* const testToken = */ await deploy("ERC20", {
    from: deployer,
    args: ["My Cool Token", "COOL", 69000000],
    log: true,
  });

  // leave this commented because we never want to deploy it again on any network.
  // the exception might be a testnet somewhere
  // const onlyMoons = await deploy("OnlyMoons", {
  //   from: deployer,
  //   log: true,
  // });

  // const tokenData = await deploy("TokenData", {
  //   from: deployer,
  //   log: true,
  // });

  // const tokenStats = await deploy('TokenStats', {
  //   from: deployer,
  //   log: true
  // })

  // const tokenLockerManagerV1 = await deploy("TokenLockerManagerV1", {
  //   from: deployer,
  //   // args: [],
  //   log: true,
  //   libraries: {
  //     Util: utilLibrary.address,
  //   },
  // });

  // // NOTE: we don't actually need to deploy this for any reason
  // // other than verifying the contract so future instances
  // // will automatically be verified on scan sites.
  // const tokenLockerV1 = await deploy("TokenLockerV1", {
  //   from: deployer,
  //   args: [
  //     tokenLockerManagerV1.address,
  //     0,
  //     deployer,
  //     testToken.address,
  //     99999999999,
  //   ],
  //   libraries: {
  //     Util: utilLibrary.address,
  //   },
  //   log: true,
  // });

  // const splitStakingV1 = await deploy("SplitStakingV1", {
  //   from: deployer,
  //   log: true,
  //   // args: [],
  //   libraries: {
  //     Math: mathLibrary.address,
  //   },
  // });

  // const fees = await deploy("Fees", {
  //   from: deployer,
  //   log: true,
  //   args: [
  //     // address payable treasuryFeeAddress_
  //     deployer,
  //     // address payable stakingFeeAddress_
  //     splitStakingV1.address,
  //   ],
  // });

  // const stakingFactoryV1 = await deploy("StakingFactoryV1", {
  //   from: deployer,
  //   log: true,
  //   args: [],
  // });

  // const stakingManagerV1 = await deploy("StakingManagerV1", {
  //   from: deployer,
  //   log: true,
  //   args: [
  //     // factory address
  //     stakingFactoryV1.address,
  //     fees.address,
  //   ],
  //   libraries: {
  //     Math: mathLibrary.address,
  //   },
  // });

  // const stakingV1 = await deploy("StakingV1", {
  //   from: deployer,
  //   log: true,
  //   args: [
  //     // address owner_,
  //     deployer,
  //     // address tokenAddress_,
  //     testToken.address,
  //     // uint16 lockDurationDays_
  //     0,
  //   ],
  //   libraries: {
  //     Math: mathLibrary.address,
  //     SafeERC20: safeERC20Library.address,
  //   },
  // });

  // const stakingTokenV1 = await deploy("StakingTokenV1", {
  //   from: deployer,
  //   log: true,
  //   args: [
  //     // address owner_,
  //     deployer,
  //     // address tokenAddress_,
  //     testToken.address,
  //     // address rewardsTokenAddress_,
  //     testToken.address,
  //     // uint16 lockDurationDays_
  //     0,
  //   ],
  //   libraries: {
  //     Math: mathLibrary.address,
  //     SafeERC20: safeERC20Library.address,
  //   },
  // });

  /*
    // Getting a previously deployed contract
    const YourContract = await ethers.getContract("YourContract", deployer);
    await YourContract.setPurpose("Hello");
  
    To take ownership of yourContract using the ownable library uncomment next line and add the 
    address you want to be the owner. 
    // yourContract.transferOwnership(YOUR_ADDRESS_HERE);

    //const yourContract = await ethers.getContractAt('YourContract', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!
  */

  /*
  //If you want to send value to an address from the deployer
  const deployerWallet = ethers.provider.getSigner()
  await deployerWallet.sendTransaction({
    to: "0x34aA3F359A9D614239015126635CE7732c18fDF3",
    value: ethers.utils.parseEther("0.001")
  })
  */

  /*
  //If you want to send some ETH to a contract on deploy (make your constructor payable!)
  const yourContract = await deploy("YourContract", [], {
  value: ethers.utils.parseEther("0.05")
  });
  */

  /*
  //If you want to link a library into your contract:
  // reference: https://github.com/austintgriffith/scaffold-eth/blob/using-libraries-example/packages/hardhat/scripts/deploy.js#L19
  const yourContract = await deploy("YourContract", [], {}, {
   LibraryName: **LibraryAddress**
  });
  */
};
module.exports.tags = ["OnlyMoons"];
