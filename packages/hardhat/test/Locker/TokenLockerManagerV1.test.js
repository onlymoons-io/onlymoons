const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("TokenLockerManagerV1.sol", () => {
  let erc20;
  let utilContract;
  let tokenLockerManagerV1Contract;

  before(async () => {
    const UtilContract = await ethers.getContractFactory("Util");
    utilContract = await UtilContract.deploy();
  });

  before(async () => {
    const ERC20 = await ethers.getContractFactory("ERC20");
    erc20 = await ERC20.deploy("ERC20", "ERC20", 1000000);
  });

  it("Should deploy TokenLockerManagerV1", async () => {
    const TokenLockerManagerV1Contract = await ethers.getContractFactory(
      "TokenLockerManagerV1",
      {
        libraries: {
          Util: utilContract.address,
        },
      }
    );
    tokenLockerManagerV1Contract = await TokenLockerManagerV1Contract.deploy();
  });

  it("Should approve TokenLockerManagerV1 to spend ERC20", async () => {
    await erc20.approve(tokenLockerManagerV1Contract.address, 1);
  });

  describe("createTokenLocker(address tokenAddress_,uint256 amount_,uint40 unlockTime_)", () => {
    // 1 hour from now
    const unlockTime = Math.floor(Date.now() / 1000 + 60 * 60);

    it("Should create locker", async () => {
      await tokenLockerManagerV1Contract.createTokenLocker(
        erc20.address,
        1,
        unlockTime
      );
    });

    let lockData;

    it("Should get lockData", async () => {
      lockData = await tokenLockerManagerV1Contract.getTokenLockData(0);

      expect(lockData).to.not.equal(undefined);
    });

    it("Locker should contain OnlyMoons token", () => {
      expect(lockData.token).to.equal(erc20.address);
    });

    it("Should contain the correct balance", () => {
      expect(lockData.balance).to.equal(1);
    });
  });
});
