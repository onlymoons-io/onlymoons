const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("StakingFactoryV1.sol", () => {
  let erc20;
  let stakingFactoryV1;

  before(async () => {
    const ERC20 = await ethers.getContractFactory("ERC20");
    erc20 = await ERC20.deploy("ERC20", "ERC20", 1000000);
  });

  it("Should deploy StakingFactoryV1", async () => {
    const StakingFactoryV1Contract = await ethers.getContractFactory(
      "StakingFactoryV1"
    );
    stakingFactoryV1 = await StakingFactoryV1Contract.deploy();
  });

  it("Should create eth reflection staking contract", async () => {
    // function createStaking(
    //   uint8 stakingType_,
    //   address tokenAddress_,
    //   uint16 lockDurationDays_,
    //   uint256[] memory typeData_
    // ) external virtual override onlyAuthorized onlyNotPaused returns (address)
    const address = await stakingFactoryV1.createStaking(
      0, // 0 = eth reflection
      erc20.address, // staked token
      0, // 0 lock days
      [] // no additional data needed for eth reflection
    );

    expect(address).to.not.equal(undefined);
  });

  it("Should create token reflection staking contract", async () => {
    const address = await stakingFactoryV1.createStaking(
      1, // 1 = token reflection
      erc20.address, // staked token
      0, // 0 lock days
      [
        // rewards token
        erc20.address,
      ]
    );

    expect(address).to.not.equal(undefined);
  });
});
