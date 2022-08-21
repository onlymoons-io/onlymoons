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

import { ITokenLockerManagerV2 } from "./ITokenLockerManagerV2.sol";
import { Governable } from "../Governance/Governable.sol";
import { Pausable } from "../Control/Pausable.sol";
import { IDCounter } from "../IDCounter.sol";
import { ITokenLockerBaseV2 } from "./ITokenLockerBaseV2.sol";
// import { ITokenLockerLPV2 } from "./ITokenLockerLPV2.sol";
import { ITokenLockerFactoryV2 } from "./ITokenLockerFactoryV2.sol";
import { IERC20 } from "../library/IERC20.sol";
// import { INonfungiblePositionManager } from "../library/uniswap-v3/INonfungiblePositionManager.sol";

contract TokenLockerManagerV2 is ITokenLockerManagerV2, Governable, Pausable, IDCounter {
  constructor(address factoryAddress_) Governable(_msgSender(), _msgSender()) {
    _setFactory(factoryAddress_);

    // shared uniswap v2 locker
    (_uniswapV2LockId,) = _createTokenLocker(0);

    // shared uniswap v3 locker
    (_uniswapV3LockId,) = _createTokenLocker(1);
  }

  ITokenLockerFactoryV2 internal _factory;

  uint40 internal immutable _uniswapV2LockId;
  uint40 internal immutable _uniswapV3LockId;

  mapping(uint40 => address) internal _locks;

  function factory() external virtual returns (address) {
    return address(_factory);
  }

  function _setFactory(address address_) internal virtual {
    _factory = ITokenLockerFactoryV2(address_);
  }

  function setFactory(address address_) external virtual onlyOwner {
    _setFactory(address_);
  }

  /**
   * @dev _count is a uint256, but locker V1 used uint40, so we cast to uint40.
   * since the max value is uint40 is over a trillion, i think it will be ok.
   */
  function tokenLockerCount() external virtual view returns (uint40) {
    return uint40(_count);
  }

  /**
   * @dev maps to _paused to maintain compatibility with locker V1
   */
  function creationEnabled() external virtual view returns (bool) {
    return _paused;
  }
  
  /**
   * @dev maps to _setPaused to maintain compatibility with locker V1
   */
  function setCreationEnabled(bool value_) external virtual onlyOwner {
    _setPaused(value_);
  }

  function _createTokenLocker(
    uint8 lockType_,
    bytes memory extraData_
  ) internal virtual returns (
    uint40 id,
    address lockAddress
  ) {
    id = uint40(_next());
    lockAddress = _factory.createLocker(
      lockType_,
      address(this),
      id,
      extraData_
    );
    _locks[id] = lockAddress;
  }

  function _createTokenLocker(
    uint8 lockType_
  ) internal virtual returns (
    uint40 id,
    address lockAddress
  ) {
    id = uint40(_next());
    lockAddress = _factory.createLocker(
      lockType_,
      address(this),
      id,
      new bytes(0)
    );
    _locks[id] = lockAddress;
  }

  function createTokenLocker(
    address tokenAddress_,
    uint256 amount_,
    uint40 unlockTime_
  ) external virtual override onlyNotPaused {

    // _createTokenLocker(lockType_, extraData_);
  }

  // function createTokenLocker(
  //   address tokenAddress_,
  //   uint256 amount_,
  //   uint40 unlockTime_
  // ) external virtual onlyNotPaused {
  //   _createTokenLocker(
  //     3 // 3 = erc20 token
  //   );
  // }

  /**
   * @dev this is the same as createTokenLocker, but it
   * returns the id and address of the created lock.
   */
  function createTokenLockerV2(
    uint8 lockType_,
    bytes memory extraData_
  ) external virtual onlyNotPaused returns (
    uint40 id,
    address lockAddress
  ) {
    return _createTokenLocker(lockType_, extraData_);
  }

  function getTokenLockAddress(uint40 id_) external virtual view returns (address) {
    require(id_ < _count, "Invalid id");
    return _locks[id_];
  }

  function getTokenLockData(uint40 id_) external virtual view returns (
    bool isLpToken,
    uint40 id,
    address contractAddress,
    address lockOwner,
    address token,
    address createdBy,
    uint40 createdAt,
    uint40 unlockTime,
    uint256 balance,
    uint256 totalSupply
  ) {

  }

  function getLpData(uint40 id_) external virtual view returns (
    bool hasLpData,
    uint40 id,
    address token0,
    address token1,
    uint256 balance0,
    uint256 balance1,
    uint256 price0,
    uint256 price1
  ) {

  }

  function getTokenLockersForAddress(
    address address_
  ) external virtual view returns (
    uint40[] memory
  ) {

  }

  function notifyLockerOwnerChange(
    uint40 id_,
    address newOwner_,
    address previousOwner_,
    address createdBy_
  ) external virtual {

  }
}
