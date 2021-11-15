// deploy/00_deploy_your_contract.js

//const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // const mathLibrary = await deploy("Math", {
  //   from: deployer,
  //   log: true,
  // });

  // // const safeMathLibrary = await deploy("SafeMath", {
  // //   from: deployer,
  // //   log: true,
  // // });

  const utilLibrary = await deploy("Util", {
    from: deployer,
    log: true,
  });

  const testToken = await deploy("ERC20", {
    from: deployer,
    args: ["My Cool Token", "COOL", 69000000],
    log: true,
  });

  // const tokenData = await deploy("TokenData", {
  //   from: deployer,
  //   log: true,
  // });

  // const tokenStats = await deploy('TokenStats', {
  //   from: deployer,
  //   log: true
  // })

  // deploy the token locker contracts so we can get their ABI with scaffold.
  // there must be an alternative to actually deploying the contracts?
  {
    const tokenLockerV1 = await deploy("TokenLockerV1", {
      from: deployer,
      args: [0, deployer, testToken.address, 99999999999],
      libraries: {
        Util: utilLibrary.address,
      },
      log: true,
    });
  }

  const tokenLockerManagerV1 = await deploy("TokenLockerManagerV1", {
    from: deployer,
    // args: [],
    log: true,
    libraries: {
      Util: utilLibrary.address,
    },
  });

  // const launchpaidToken = await deploy("Launchpaid", {
  //   // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
  //   from: deployer,
  //   args: [
  //     // name
  //     "Launchpaid",
  //     // symbol
  //     "LAUNCH",
  //     // decimals
  //     18,
  //     // total supply
  //     500000000,
  //   ],
  //   log: true,
  // });

  // const launchpaidStaking = await deploy("LaunchpaidStaking", {
  //   // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
  //   from: deployer,
  //   args: [launchpaidToken.address],
  //   log: true,
  //   libraries: {
  //     Math: mathLibrary.address,
  //   },
  // });

  // const launchpaidFeatured = await deploy("LaunchpaidFeatured", {
  //   from: deployer,
  //   log: true,
  // });

  // // // we need to deploy the launch contract so we
  // // // get the ABI automatically in the frontend.
  // // // maybe there's another way, since we don't
  // // // actually need to deploy this now.
  // // await deploy("LaunchpaidLaunch", {
  // //   from: deployer,
  // //   log: true,
  // // });

  // await deploy("LaunchpaidLauncher", {
  //   // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
  //   from: deployer,
  //   args: [
  //     launchpaidToken.address,
  //     launchpaidStaking.address,
  //     // launchpaidFeatured.address,
  //   ],
  //   log: true,
  //   libraries: {
  //     Math: mathLibrary.address,
  //     // SafeMath: safeMathLibrary.address,
  //     Util: utilLibrary.address,
  //   },
  // });

  // await deploy("YourContract", {
  //   // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
  //   from: deployer,
  //   //args: [ "Hello", ethers.utils.parseEther("1.5") ],
  //   log: true,
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
