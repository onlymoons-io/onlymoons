const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("TokenLockerV1.sol", () => {
  let erc20;
  let utilContract;
  let tokenLockerManagerV1Contract;
  let tokenLockerV1Contract;

  before(async () => {
    const UtilContract = await ethers.getContractFactory("Util");
    utilContract = await UtilContract.deploy();
  });

  before(async () => {
    const ERC20 = await ethers.getContractFactory("ERC20");
    erc20 = await ERC20.deploy("ERC20", "ERC20", 1000000);
  });

  before(async () => {
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

  it("Should deploy TokenLockerV1", async () => {
    const TokenLockerV1Contract = await ethers.getContractFactory(
      "TokenLockerV1",
      {
        libraries: {
          Util: utilContract.address,
        },
      }
    );

    // 10 seconds from now
    const unlockTime = Math.floor(Date.now() / 1000 + 15);

    // constructor(address manager_, uint40 id_, address owner_, address tokenAddress_, uint40 unlockTime_)
    tokenLockerV1Contract = await TokenLockerV1Contract.deploy(
      tokenLockerManagerV1Contract.address,
      1,
      // owner
      await (await ethers.provider.getSigner()).getAddress(),
      erc20.address,
      unlockTime
    );
  });

  it("Should transfer tokens to locker", async () => {
    await erc20.transfer(tokenLockerV1Contract.address, 1);

    // verify
    expect(await erc20.balanceOf(tokenLockerV1Contract.address)).to.equal(1);
  });

  // it("Should reject withdrawing from wrong account", async () => {
  //   await expect(tokenLockerV1Contract.withdraw()).to.be.revertedWith(
  //     "Only the owner can execute this function"
  //   );
  // });

  it("Should revert on early withdrawal", async () => {
    // NOTE: this is actually failing because it's being called from the wrong address, and onlyOwner is reverting
    await expect(tokenLockerV1Contract.withdraw()).to.be.revertedWith(
      "Wait until unlockTime to withdraw"
    );
  });

  it("Should allow withdrawal after unlockTime", async () => {
    // wait for unlockTime
    await new Promise((resolve) => setTimeout(resolve, 15000));

    await tokenLockerV1Contract.withdraw();

    // balance should now be 0
    expect(await erc20.balanceOf(tokenLockerV1Contract.address)).to.equal(0);
  });

  it("Should deposit and extend lock duration", async () => {
    const newUnlockTime = parseInt(Date.now() / 1000 + 60 * 60);

    await erc20.approve(tokenLockerV1Contract.address, 1);
    await tokenLockerV1Contract.deposit(1, newUnlockTime);

    // bool isLpToken,
    // uint40 id,
    // address contractAddress,
    // address lockOwner,
    // address token,
    // address createdBy,
    // uint40 createdAt,
    // uint40 unlockTime,
    // uint256 balance,
    // uint256 totalSupply
    const { balance, unlockTime } = await tokenLockerV1Contract.getLockData();

    expect(balance).to.equal(1);
    expect(unlockTime).to.equal(newUnlockTime);
  });

  // NOTE this is not possible to test unless we deploy TokenLockerV1 using TokenLockerManagerV1.createTokenLocker.
  // this is because transferOwnership calls TokenLockerManagerV1.notifyLockerOwnerChange, which can only be called
  // by locks created with the manager.
  // it("Should transfer ownership", async () => {
  //   await tokenLockerV1Contract.transferOwnership(
  //     "0x000000000000000000000000000000000000dEaD"
  //   );

  //   expect(await tokenLockerV1Contract.owner()).to.equal(
  //     "0x000000000000000000000000000000000000dEaD"
  //   );
  // });
});
