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
import { TokenLockerERC20V2 } from "./TokenLockerERC20V2.sol";
import { IERC20 } from "../library/IERC20.sol";
import { IUniswapV2Pair, IUniswapV2Router02, IUniswapV2Factory } from "../library/Dex.sol";
import { SafeERC20 } from "../library/SafeERC20.sol";
import { AllowedDexes } from "../common/AllowedDexes.sol";
import { Util } from "../Util.sol";

contract TokenLockerUniV2 is ITokenLockerUniV2, TokenLockerLPV2, TokenLockerERC20V2, AllowedDexes {
  using SafeERC20 for IERC20;

  constructor() TokenLockerManagerV2() {}

  function _createTokenLocker(
    address tokenAddress_,
    uint256 amount_,
    uint40 unlockTime_
  ) internal virtual override returns (
    uint40 id,
    address lockAddress
  ) {
    // check if this is a uniswap v2 lp token
    require(Util.isLpToken(tokenAddress_), "INVALID_TOKEN");

    // this should throw an error if it's not a valid pair,
    // which is what we want to happen as early as possible.
    IUniswapV2Pair pair = IUniswapV2Pair(tokenAddress_);
    address token0 = pair.token0();
    address token1 = pair.token1();

    id = uint40(_next());
    lockAddress = address(this);

    // write to state before transfer
    _locks[id].tokenAddress = tokenAddress_;
    _locks[id].createdAt = uint40(block.timestamp);
    _locks[id].createdBy = _msgSender();
    _locks[id].owner = _msgSender();

    // duration creation, if unlockTime is 0,
    // we use unlock countdown instead of unlock time.
    // this value cannot be updated after creation.
    if (unlockTime_ == 0) {
      _takeFee("CreateInfiniteLock");
      _locks[id].useUnlockCountdown = true;
    }

    // make the deposit - this also sets unlock time
    _deposit(id, amount_, unlockTime_);

    // build search index
    _tokenLockersForAddress[_msgSender()].push(id);
    _tokenLockersForAddressLookup[_msgSender()][id] = true;
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

  function _deposit(
    uint40 id_,
    uint256 amount_,
    uint40 newUnlockTime_
  ) internal virtual override {
    if (_locks[id_].useUnlockCountdown) {
      // reset countdown on deposit
      _locks[id_].unlockTime = type(uint40).max;
    } else {
      require(
        newUnlockTime_ >= _locks[id_].unlockTime && newUnlockTime_ > uint40(block.timestamp),
        "TOO_SOON"
      );

      _locks[id_].unlockTime = newUnlockTime_;
    }
    
    _locks[id_].extendedAt = uint40(block.timestamp);

    // add to locked amount local state before transfer
    _locks[id_].amountOrTokenId += amount_;

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

    emit TokenLockerDeposit(
      id_,
      amount_,
      _locks[id_].amountOrTokenId,
      _locks[id_].unlockTime
    );
  }

  function withdraw(
    uint40 id_
  ) external virtual override onlyLockOwner(id_) nonReentrant {
    require(uint40(block.timestamp) >= _locks[id_].unlockTime, "LOCKED");

    uint256 amount = _locks[id_].amountOrTokenId;

    // save to local state before transfer
    _locks[id_].amountOrTokenId = 0;

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

    emit TokenLockerWithdrawal(id_);
  }

  function getLpData(
    uint40 id_
  ) external virtual override view returns (
    bool hasLpData,
    uint40 id,
    address token0,
    address token1,
    uint256 balance0,
    uint256 balance1
  ) {
    // hardcode this to true to remain compatibility with v1
    hasLpData = true;
    // pass-through, don't like this, but w/e
    id = id_;
    (
      token0,
      token1,
      balance0,
      balance1,,
    ) = Util.getLpData(_locks[id_].tokenAddress);
  }

  function migrate(
    uint40 id_,
    address oldRouterAddress_,
    address newRouterAddress_
  ) external virtual override onlyLockOwner(id_) takeFee("MigrateLock") nonReentrant {
    require(
      _allowedDexes[_allowedDexesByRouter[newRouterAddress_]].allowed,
      "INVALID_ROUTER"
    );

    IUniswapV2Pair oldPair = IUniswapV2Pair(_locks[id_].tokenAddress);

    // approve the old router
    IERC20(_locks[id_].tokenAddress).safeApprove(oldRouterAddress_, _locks[id_].amountOrTokenId);

    // unpair on old router and send tokens to this address
    (
      uint256 amountRemoved0,
      uint256 amountRemoved1
    ) = IUniswapV2Router02(
      oldRouterAddress_
    ).removeLiquidity(
      oldPair.token0(),
      oldPair.token1(),
      _locks[id_].amountOrTokenId,
      // accept any amount of "slippage"
      0,0,
      // send unpaired tokens to this address temporarily
      address(this),
      // must finish in the same tx
      block.timestamp
    );

    // approve the new router
    IERC20(oldPair.token0()).safeApprove(newRouterAddress_, amountRemoved0);
    IERC20(oldPair.token1()).safeApprove(newRouterAddress_, amountRemoved1);

    IUniswapV2Router02 newRouter = IUniswapV2Router02(newRouterAddress_);

    (
      uint256 amountAdded0,
      uint256 amountAdded1,
      uint256 newTokenAmount
    ) = newRouter.addLiquidity(
      oldPair.token0(),
      oldPair.token1(),
      amountRemoved0,
      amountRemoved1,
      // accept any amount of "slippage"
      0,0,
      // send the new lp tokens to this address
      address(this),
      // must finish in the same tx
      block.timestamp
    );

    // amount removed and amount added must match or something went wrong
    require(
      amountAdded0 == amountRemoved0 && amountAdded1 == amountRemoved1,
      "LOST_TOKENS"
    );

    // update the existing lock instead of creating a new one
    _locks[id_].tokenAddress = IUniswapV2Factory(
      newRouter.factory()
    ).getPair(
      oldPair.token0(),
      oldPair.token1()
    );
    _locks[id_].amountOrTokenId = newTokenAmount;

    emit MigratedDex(
      id_,
      oldRouterAddress_,
      newRouterAddress_
    );
  }

  function splitLock(
    uint40 id_,
    uint256 amount_,
    address newOwner_
  ) external payable virtual override onlyLockOwner(id_) takeFee("SplitLock") nonReentrant returns (
    uint40 id
  ) {
    require(amount_ <= _locks[id_].amountOrTokenId, "INSUFFICIENT_TOKENS");

    // this should throw an error if it's not a valid pair,
    // which is what we want to happen as early as possible.
    IUniswapV2Pair pair = IUniswapV2Pair(_locks[id_].tokenAddress);
    address token0 = pair.token0();
    address token1 = pair.token1();

    id = uint40(_next());

    _locks[id].tokenAddress = _locks[id_].tokenAddress;
    _locks[id].createdAt = uint40(block.timestamp);
    _locks[id].extendedAt = _locks[id].createdAt;
    _locks[id].createdBy = newOwner_;
    _locks[id].owner = newOwner_;
    // if the previous lock was an infinite lock, don't make them pay the fee again
    _locks[id].useUnlockCountdown = _locks[id_].useUnlockCountdown;
    _locks[id].unlockTime = _locks[id_].unlockTime;

    // add amount to new lock
    _locks[id].amountOrTokenId = amount_;
    // subtract amount from old lock
    _locks[id_].amountOrTokenId -= amount_;

    // build search index
    _tokenLockersForAddress[newOwner_].push(id);
    _tokenLockersForAddress[_locks[id].tokenAddress].push(id);
    _tokenLockersForAddress[token0].push(id);
    _tokenLockersForAddress[token1].push(id);

    emit TokenLockerCreated(
      id,
      _locks[id].tokenAddress,
      token0,
      token1,
      newOwner_,
      amount_,
      _locks[id].unlockTime
    );
  }

  function updateAllowedDex(
    address router_,
    string calldata name_,
    bool allowed_
  ) external virtual override onlyOwnerOrGovernor {
    _updateAllowedDex(router_, name_, allowed_);
  }
}