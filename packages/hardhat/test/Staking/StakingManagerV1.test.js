const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("StakingManagerV1.sol", () => {
  let erc20;
  let fees;
  let stakingFactoryV1;
  let stakingManagerV1;

  before(async () => {
    const Fees = await ethers.getContractFactory("Fees");
    // constructor(address payable treasuryFeeAddress_, address payable stakingFeeAddress_)
    fees = await Fees.deploy(
      "0x000000000000000000000000000000000000dEaD",
      "0x000000000000000000000000000000000000dEaD"
    );
  });

  before(async () => {
    const StakingFactoryV1 = await ethers.getContractFactory(
      "StakingFactoryV1"
    );
    stakingFactoryV1 = await StakingFactoryV1.deploy();
  });

  before(async () => {
    const ERC20 = await ethers.getContractFactory("ERC20");
    erc20 = await ERC20.deploy("ERC20", "ERC20", 1000000);
  });

  it("Should deploy StakingManagerV1", async () => {
    const StakingManagerV1Contract = await ethers.getContractFactory(
      "StakingManagerV1"
    );

    // constructor(address factoryAddress, address feesAddress)
    stakingManagerV1 = await StakingManagerV1Contract.deploy(
      stakingFactoryV1.address,
      fees.address
    );
  });

  it("Should authorize StakingManagerV1 to use StakingFactoryV1", async () => {
    stakingFactoryV1.authorize(stakingManagerV1.address, true);
  });

  it("Should deploy eth reflection staking", async () => {
    // uint8 stakingType_,
    // address tokenAddress_,
    // uint16 lockDurationDays_,
    // uint256[] memory typeData_
    await stakingManagerV1.createStaking(0, erc20.address, 0, []);
  });

  it("Should deploy token reflection staking", async () => {
    await stakingManagerV1.createStaking(1, erc20.address, 0, [erc20.address]);
  });
});
