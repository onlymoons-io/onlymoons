// SPDX-License-Identifier: GPL-3.0+

/**
  /$$$$$$            /$$           /$$      /$$                                        
 /$$__  $$          | $$          | $$$    /$$$                                        
| $$  \ $$ /$$$$$$$ | $$ /$$   /$$| $$$$  /$$$$  /$$$$$$   /$$$$$$  /$$$$$$$   /$$$$$$$
| $$  | $$| $$__  $$| $$| $$  | $$| $$ $$/$$ $$ /$$__  $$ /$$__  $$| $$__  $$ /$$_____/
| $$  | $$| $$  \ $$| $$| $$  | $$| $$  $$$| $$| $$  \ $$| $$  \ $$| $$  \ $$|  $$$$$$ 
| $$  | $$| $$  | $$| $$| $$  | $$| $$\  $ | $$| $$  | $$| $$  | $$| $$  | $$ \____  $$
|  $$$$$$/| $$  | $$| $$|  $$$$$$$| $$ \/  | $$|  $$$$$$/|  $$$$$$/| $$  | $$ /$$$$$$$/
 \______/ |__/  |__/|__/ \____  $$|__/     |__/ \______/  \______/ |__/  |__/|_______/ 
                         /$$  | $$                                                     
                        |  $$$$$$/                                                     
                         \______/                                                      

  https://onlymoons.io/
*/

pragma solidity ^0.8.0;

import { ITokenLockerUniV2 } from "./ITokenLockerUniV2.sol";
import { TokenLockerManagerV2 } from "./TokenLockerManagerV2.sol";
import { TokenLockerLPV2 } from "./TokenLockerLPV2.sol";
import { IERC20 } from "../library/IERC20.sol";
import { IUniswapV2Pair, IUniswapV2Router02, IUniswapV2Factory } from "../library/Dex.sol";
import { SafeERC20 } from "../library/SafeERC20.sol";
import { Util } from "../Util.sol";

struct UniV2LockData {
  address tokenAddress;
  address owner;
  address createdBy;
  uint256 amount;
  uint40 createdAt;
  uint40 extendedAt;
  uint40 unlockTime;
}

contract TokenLockerUniV2 is ITokenLockerUniV2, TokenLockerLPV2 {
  using SafeERC20 for IERC20;

  /** @dev initialize TokenLockerManagerV2 without a valid factory, because we don't need one */
  constructor() TokenLockerManagerV2(address(0)) {}

  mapping(uint40 => UniV2LockData) internal _locks;

  function _ownerAuthorized(uint40 id) internal virtual override view returns (bool) {
    return _msgSender() == _locks[id].owner;
  }

  function _createTokenLocker(
    address tokenAddress_,
    uint256 amount_,
    uint40 unlockTime_
  ) internal virtual returns (
    uint40 id
  ) {
    // this should throw an error if it's not a valid pair,
    // which is what we want to happen as early as possible.
    IUniswapV2Pair pair = IUniswapV2Pair(tokenAddress_);
    address token0 = pair.token0();
    address token1 = pair.token1();

    id = uint40(_next());

    // write to state before transfer
    _locks[id].tokenAddress = tokenAddress_;
    _locks[id].createdAt = uint40(block.timestamp);
    _locks[id].createdBy = _msgSender();
    _locks[id].owner = _msgSender();

    // make the deposit - this also sets unlock time
    _deposit(id, amount_, unlockTime_);

    // build search index
    _tokenLockersForAddress[_msgSender()].push(id);
    _tokenLockersForAddress[tokenAddress_].push(id);
    _tokenLockersForAddress[token0].push(id);
    _tokenLockersForAddress[token1].push(id);

    emit TokenLockerCreated(
      id,
      tokenAddress_,
      token0,
      token1,
      _msgSender(),
      amount_,
      unlockTime_
    );
  }

  function createTokenLocker(
    address tokenAddress_,
    uint256 amount_,
    uint40 unlockTime_
  ) external virtual override onlyNotPaused nonReentrant {
    _createTokenLocker(tokenAddress_, amount_, unlockTime_);
  }

  function createTokenLockerV2(
    address tokenAddress_,
    uint256 amount_,
    uint40 unlockTime_,
    string[] calldata socialKeys_,
    string[] calldata socialUrls_
  ) external virtual override onlyNotPaused nonReentrant returns (
    uint40 id,
    address lockAddress
  ) {
    id = _createTokenLocker(tokenAddress_, amount_, unlockTime_);
    lockAddress = address(this);
    _setSocials(id, socialKeys_, socialUrls_);
  }

  function getLpData(uint40 id_) external virtual override view returns (
    bool hasLpData,
    uint40 id,
    address token0,
    address token1,
    uint256 balance0,
    uint256 balance1,
    uint256 price0,
    uint256 price1
  ) {
    // hardcode this to true to remain compatibility with v1
    hasLpData = true;
    id = id_;
    (
      token0,
      token1,
      balance0,
      balance1,,
    ) = Util.getLpData(_locks[id_].tokenAddress);
    // price0 and price1 are deprecated and not used.
    price0 = 0;
    price1 = 0;
  }

  function _transferLockOwnership(uint40 id_, address newOwner_) internal virtual override {
    address oldOwner = _locks[id_].owner;
    _locks[id_].owner = newOwner_;

    // we don't actually need to remove old owners from the search index. who cares.
    // but we do need to add the new owner. only add id if they didn't already have it.
    if (!_tokenLockersForAddressLookup[newOwner_][id_]) {
      _tokenLockersForAddress[newOwner_].push(id_);
      _tokenLockersForAddressLookup[newOwner_][id_] = true;
    }

    emit LockOwnershipTransfered(
      id_,
      oldOwner,
      newOwner_
    );
  }

  function _deposit(uint40 id_, uint256 amount_, uint40 newUnlockTime_) internal virtual {
    require(newUnlockTime_ > uint40(block.timestamp), "TOO_SOON");

    // make note of extended time if needed
    if (newUnlockTime_ > _locks[id_].unlockTime) {
      _locks[id_].unlockTime = newUnlockTime_;
      _locks[id_].extendedAt = uint40(block.timestamp);
    }

    // add to locked amount local state before transfer
    _locks[id_].amount += amount_;

    IERC20 token = IERC20(_locks[id_].tokenAddress);

    uint256 oldBalance = token.balanceOf(address(this));
    token.safeTransferFrom(_msgSender(), address(this), amount_);
    uint256 newBalance = token.balanceOf(address(this));
    uint256 amountSent = newBalance - oldBalance;

    // throw an error if the amount of tokens transfered
    // does not match the amount_ desired to lock.
    // typically this would mean there was tax or something,
    // which shouldn't happen on LP tokens, but check anyway.
    require(amount_ == amountSent, "BORKED_TRANSFER");
  }

  function deposit(
    uint40 id_,
    uint256 amount_,
    uint40 newUnlockTime_
  ) external virtual override onlyLockOwner(id_) nonReentrant {
    _deposit(id_, amount_, newUnlockTime_);
  }

  function withdrawById(uint40 id_) external virtual override onlyLockOwner(id_) nonReentrant {
    require(uint40(block.timestamp) >= _locks[id_].unlockTime, "LOCKED");

    uint256 amount = _locks[id_].amount;

    // save to local state before transfer
    _locks[id_].amount = 0;

    IERC20 token = IERC20(_locks[id_].tokenAddress);
    uint256 oldBalance = token.balanceOf(address(this));
    token.safeTransfer(_locks[id_].owner, amount);
    uint256 newBalance = token.balanceOf(address(this));
    uint256 amountSent = oldBalance - newBalance;

    // throw an error if the amount of tokens transfered
    // does not match the `amount` locked.
    // typically this would mean there was tax or something,
    // which shouldn't happen on LP tokens, but check anyway.
    require(amount == amountSent, "BORKED_TRANSFER");
  }

  function migrate(
    uint40 id_,
    address oldRouterAddress_,
    address newRouterAddress_
  ) external virtual override onlyLockOwner(id_) onlyLockExists(id_) nonReentrant {
    require(_allowedRouters[newRouterAddress_], "INVALID_ROUTER");

    IUniswapV2Pair oldPair = IUniswapV2Pair(_locks[id_].tokenAddress);

    // unpair on old router and send tokens to this address
    (
      uint256 amountRemoved0,
      uint256 amountRemoved1
    ) = IUniswapV2Router02(
      oldRouterAddress_
    ).removeLiquidity(
      oldPair.token0(),
      oldPair.token1(),
      _locks[id_].amount,
      // accept any amount of "slippage"
      0,
      0,
      address(this),
      block.timestamp
    );

    require(amountRemoved0 > 0 && amountRemoved1 > 0, "NO_LIQ");

    IUniswapV2Router02 newRouter = IUniswapV2Router02(newRouterAddress_);

    (
      uint256 amount0,
      uint256 amount1,
      uint256 newTokenAmount
    ) = newRouter.addLiquidity(
      oldPair.token0(),
      oldPair.token1(),
      amountRemoved0,
      amountRemoved1,
      // accept any amount of "slippage"
      0,
      0,
      address(this),
      block.timestamp
    );

    require(amount0 == amountRemoved0 && amount1 == amountRemoved1, "LOST_TOKENS");

    address tokenAddress = IUniswapV2Factory(
      newRouter.factory()
    ).getPair(
      oldPair.token0(),
      oldPair.token1()
    );

    _locks[id_].tokenAddress = tokenAddress;
    _locks[id_].amount = newTokenAmount;
  }
}
