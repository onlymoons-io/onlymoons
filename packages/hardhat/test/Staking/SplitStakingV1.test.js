const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("SplitStakingV1.sol", () => {
  let erc20;
  let splitStakingV1;
  let soloStaking;

  before(async () => {
    const ERC20 = await ethers.getContractFactory("ERC20");
    erc20 = await ERC20.deploy("ERC20", "ERC20", 1000000);
  });

  before(async () => {
    const StakingV1 = await ethers.getContractFactory("StakingV1");
    // address owner_,
    // address tokenAddress_,
    // uint16 lockDurationDays_
    soloStaking = await StakingV1.deploy(
      "0x000000000000000000000000000000000000dEaD",
      erc20.address, // staked token
      0 // 0 lock days
    );

    // TODO implement a way to test LP tokens
  });

  it("Should deploy SplitStakingV1", async () => {
    const SplitStakingV1Contract = await ethers.getContractFactory(
      "SplitStakingV1"
    );
    splitStakingV1 = await SplitStakingV1Contract.deploy();
  });

  // function getGlobalStakingData() external view returns (
  //   bool ready,
  //   address mainToken,
  //   address soloStakingAddress,
  //   address lpStakingAddress,
  //   uint16 liquidityRatio,
  //   uint16 rewardsRatio
  // )

  it("Should set solo staking address", async () => {
    await splitStakingV1.setSoloStakingAddress(soloStaking.address);

    // verify
    const { soloStakingAddress } = await splitStakingV1.getGlobalStakingData();
    expect(soloStakingAddress).to.equal(soloStaking.address);
  });
});
