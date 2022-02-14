const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("OnlyMoons.sol", () => {
  let onlyMoonsContract;

  it("Should deploy OnlyMoons Token", async () => {
    const OnlyMoonsContract = await ethers.getContractFactory("OnlyMoons");
    onlyMoonsContract = await OnlyMoonsContract.deploy();
  });

  // perform these checks as a big red flag in case they are somehow changed.
  it("Should be named OnlyMoons", async () => {
    expect(await onlyMoonsContract.name()).to.equal("OnlyMoons");
  });
  it("Should have symbol ONLYMOONS", async () => {
    expect(await onlyMoonsContract.symbol()).to.equal("ONLYMOONS");
  });
  it("Should have 18 decimals", async () => {
    expect(await onlyMoonsContract.decimals()).to.equal(18);
  });
  it("Should have a total supply of 500 million", async () => {
    expect(await onlyMoonsContract.totalSupply()).to.equal(
      ethers.utils.parseUnits("500000000", 18)
    );
  });

  it("Should allow token transfer", async () => {
    await onlyMoonsContract.transfer(
      "0x000000000000000000000000000000000000dEaD",
      1
    );

    expect(
      await onlyMoonsContract.balanceOf(
        "0x000000000000000000000000000000000000dEaD"
      )
    ).to.equal(1);
  });
});
