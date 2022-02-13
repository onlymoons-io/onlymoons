const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("Util.sol", () => {
  let erc20;
  let utilContract;

  before(async () => {
    const ERC20 = await ethers.getContractFactory("ERC20");
    // constructor(string memory name_, string memory symbol_, uint256 totalSupply_)
    erc20 = await ERC20.deploy("ERC20", "ERC20", 1000000);
  });

  it("Should deploy Util", async () => {
    const UtilContract = await ethers.getContractFactory("Util");
    utilContract = await UtilContract.deploy();
  });

  describe("getTokenData(address address_)", () => {
    it("Token should be named ERC20", async () => {
      const tokenData = await utilContract.getTokenData(erc20.address);

      expect(tokenData.name).to.equal("ERC20");
    });
  });

  describe("isLpToken(address address_)", () => {
    it("Should return false for ERC20 token", async () => {
      expect(await utilContract.isLpToken(erc20.address)).to.equal(false);
    });
  });

  // describe("getLpData(address address_)", () => {
  //   it("Should throw an error on non-LP token", async () => {
  //     expect(
  //       await utilContract.getLpData(erc20.address)
  //     ).to.throw();
  //   });
  // });
});
