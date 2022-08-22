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
import { ITokenLockerManagerV1 } from "../ITokenLockerManagerV1.sol";
import { ITokenLockerManagerV2 } from "./ITokenLockerManagerV2.sol";
import { TokenLockerManagerV2 } from "./TokenLockerManagerV2.sol";
import { TokenLockerBaseV2 } from "./TokenLockerBaseV2.sol";
import { ITokenLockerFactoryV2 } from "./ITokenLockerFactoryV2.sol";
import { IERC20 } from "../library/IERC20.sol";
import { IUniswapV2Pair } from "../library/Dex.sol";
import { SafeERC20 } from "../library/SafeERC20.sol";
import { Util } from "../Util.sol";

struct UniV2LockData {
  address tokenAddress;
  address owner;
  address createdBy;
  uint256 amount;
  uint40 createdAt;
  uint40 unlockTime;
}

contract TokenLockerUniV2 is ITokenLockerUniV2, TokenLockerManagerV2, TokenLockerBaseV2 {
  using SafeERC20 for IERC20;

  constructor() TokenLockerManagerV2(address(0)) {
    //
  }

  mapping(uint40 => UniV2LockData) internal _locks;

  function _ownerAuthorized(uint40 id) internal virtual override view returns (bool) {
    return _msgSender() == _locks[id].owner;
  }

  function factory() external virtual override(ITokenLockerManagerV2, TokenLockerManagerV2) pure returns (address) {
    return address(0);
  }

  function setFactory(address /* address_ */) external virtual override(ITokenLockerManagerV2, TokenLockerManagerV2) onlyOwner {
    revert("NOT_IMPLEMENTED");
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
    _locks[id].amount = amount_;
    _locks[id].unlockTime = unlockTime_;
    _locks[id].createdAt = uint40(block.timestamp);
    _locks[id].createdBy = _msgSender();
    _locks[id].owner = _msgSender();

    // make the transfer after writing to state.
    // track balance to determine how many tokens
    // were actually transfered.
    IERC20 token = IERC20(tokenAddress_);
    uint256 oldBalance = token.balanceOf(address(this));
    token.safeTransferFrom(_msgSender(), address(this), amount_);
    uint256 newBalance = token.balanceOf(address(this));
    uint256 amountSent = newBalance - oldBalance;

    // throw an error if the amount of tokens transfered
    // does not match the amount_ desired to lock.
    // typically this would mean there was tax or something,
    // which shouldn't happen on LP tokens, but check anyway.
    require(amount_ == amountSent, "BORKED_TRANSFER");

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
  ) external virtual override(ITokenLockerManagerV1, TokenLockerManagerV2) onlyNotPaused {
    _createTokenLocker(tokenAddress_, amount_, unlockTime_);
  }

  /**
   * @dev this is the same as createTokenLocker, but it
   * returns the id and address of the created lock.
   */
  function createTokenLockerWithReturnValue(
    address tokenAddress_,
    uint256 amount_,
    uint40 unlockTime_
  ) external virtual override(ITokenLockerManagerV2, TokenLockerManagerV2) onlyNotPaused returns (
    uint40 id,
    address lockAddress
  ) {
    id = _createTokenLocker(tokenAddress_, amount_, unlockTime_);
    lockAddress = address(this);
  }

  function getLpData(uint40 id_) external virtual override(ITokenLockerManagerV1, TokenLockerManagerV2) view returns (
    bool hasLpData,
    uint40 id,
    address token0,
    address token1,
    uint256 balance0,
    uint256 balance1,
    uint256 price0,
    uint256 price1
  ) {
    hasLpData = true;
    id = id_;
    (
      token0,
      token1,
      balance0,
      balance1,,
    ) = Util.getLpData(_locks[id_].tokenAddress);
    // price0 and price1 are deprecated and not used
    price0 = 0;
    price1 = 0;
  }

  function _transferLockOwnership(uint40 id_, address newOwner_) internal virtual {
    address oldOwner = _locks[id_].owner;
    _locks[id_].owner = newOwner_;

    emit LockOwnershipTransfered(
      id_,
      oldOwner,
      newOwner_
    );
  }

  function transferLockOwnership(
    uint40 id_,
    address newOwner_
  ) external virtual override(ITokenLockerManagerV2, TokenLockerManagerV2) {
    _transferLockOwnership(id_, newOwner_);
  }

  function notifyLockerOwnerChange(
    uint40 /* id_ */,
    address /* newOwner_ */,
    address /* previousOwner_ */,
    address /* createdBy_ */
  ) external virtual override(ITokenLockerManagerV1, TokenLockerManagerV2) {
    revert("NOT_IMPLEMENTED");
  }

  function deposit(uint40 id_, uint256 amount_, uint40 newUnlockTime_) external virtual override onlyLockOwner(id_) {

  }

  function withdraw() external virtual override {
    revert("NOT_IMPLEMENTED");
  }

  function withdrawById(uint40 id_) external virtual onlyLockOwner(id_) {
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
}
