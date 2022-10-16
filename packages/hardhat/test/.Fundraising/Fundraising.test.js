const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");
const { BigNumber } = require("ethers");

const { utils } = ethers;
const { parseEther } = utils;

use(solidity);

describe("Fundraising.sol", () => {
  let fundraisingContract;
  let endsAtTime = Math.floor(Date.now() / 1000 + 10);

  it("Should deploy Fundraising", async () => {
    const FundraisingContract = await ethers.getContractFactory(
      "Fundraising",
      {}
    );
    fundraisingContract = await FundraisingContract.deploy(
      // string memory title,
      "title",
      // string memory description,
      "description",
      // uint256[] memory data
      [
        // ends at time
        endsAtTime,
        // success threshold
        10,
      ]
    );
  });
});
