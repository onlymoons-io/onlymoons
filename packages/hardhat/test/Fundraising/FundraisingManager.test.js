const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");
const { BigNumber } = require("ethers");

use(solidity);

describe("FundraisingManager.sol", () => {
  let fundraisingManagerContract;
  let fundraisingFactoryContract;
  let endsAtTime = BigNumber.from(Math.floor(Date.now() / 1000 + 20));

  it("Should deploy FundraisingManager", async () => {
    const FundraisingManagerContract = await ethers.getContractFactory(
      "FundraisingManager",
      {}
    );
    fundraisingManagerContract = await FundraisingManagerContract.deploy();
  });

  it("Should deploy FundraisingFactory", async () => {
    const FundraisingFactoryContract = await ethers.getContractFactory(
      "FundraisingFactory",
      {}
    );
    fundraisingFactoryContract = await FundraisingFactoryContract.deploy();
  });

  it("Should authorize FundraisingManager to use FundraisingFactory", async () => {
    await fundraisingFactoryContract.authorize(
      fundraisingManagerContract.address,
      true
    );
  });

  it("Should set factory reference in FundraisingManager", async () => {
    await fundraisingManagerContract.setFactoryAddress(
      fundraisingFactoryContract.address
    );
  });

  it("Should create Fundraising instance", async () => {
    await fundraisingManagerContract.createFundraising(
      // fundraisingType
      0,
      // string memory title,
      "title",
      // string memory description,
      "description",
      // uint256[] memory data,
      [
        // uint256 endsAt,
        endsAtTime,
        // uint256 successThreshold
        BigNumber.from(10),
      ]
    );
  });

  it("Should get Fundraising data", async () => {
    const {
      // string memory title,
      title,
      // string memory description,
      description,
      // uint40 endsAt,
      // endsAt,
      // uint256 totalAmountRaised,
      totalAmountRaised,
      // uint40 numContributors
      numContributors,
    } = await fundraisingManagerContract.getFundraisingDataById(0);

    expect(title).to.equal("title");
    expect(description).to.equal("description");
    // expect(endsAt).to.equal(endsAtTime);
    expect(totalAmountRaised).to.equal(BigNumber.from(0));
    expect(numContributors).to.equal(0);
  });
});
