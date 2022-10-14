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
import { IERC20 } from "../library/IERC20.sol";
import { ReentrancyGuard } from "../library/ReentrancyGuard.sol";
import { FeeCollector } from "../Fees/FeeCollector.sol";

struct LockData {
  address tokenAddress;
  address owner;
  address createdBy;
  uint256 amountOrTokenId;
  uint40 createdAt;
  uint40 extendedAt;
  uint40 unlockTime;
  bool useUnlockCountdown;
}

contract TokenLockerManagerV2 is ITokenLockerManagerV2, Governable, Pausable, IDCounter, FeeCollector, ReentrancyGuard {
  constructor(address feesAddress_) Governable(_msgSender(), _msgSender()) {
    _setFeesContract(feesAddress_);
  }

  uint40 internal _countdownDuration = 1 weeks;
  uint40 public constant UNLOCK_MAX = type(uint40).max;

  mapping(uint40 => address) internal _lockAddresses;

  /** @dev id => lock data */
  mapping(uint40 => LockData) internal _locks;

  /**
   * @dev this mapping makes it possible to search for locks,
   * at the cost of paying higher gas fees to store the data.
   */
  mapping(address => uint40[]) internal _tokenLockersForAddress;
  mapping(address => mapping(uint40 => bool)) internal _tokenLockersForAddressLookup;

  function countdownDuration() external virtual override view returns (uint40) {
    return _countdownDuration;
  }

  function setCountdownDuration(uint40 countdownDuration_) external virtual onlyGovernor {
    // require a minimum of 1 week countdown duration.
    // do not allow any way to bypass this.
    require(countdownDuration_ >= 1 weeks, "TOO_SHORT");
    _countdownDuration = countdownDuration_;
  }

  /**
   * @dev _count is a uint256, but locker V1 used uint40, so we cast to uint40.
   * since the max value is uint40 is over a trillion, i think it will be ok.
   */
  function tokenLockerCount() external virtual override view returns (uint40) {
    return uint40(_count);
  }

  /**
   * @dev maps to !_paused to maintain compatibility with locker V1
   */
  function creationEnabled() external virtual override view returns (bool) {
    return !_paused;
  }
  
  /**
   * @dev maps to _setPaused to maintain compatibility with locker V1
   */
  function setCreationEnabled(bool value_) external virtual override onlyOwner {
    _setPaused(value_);
  }

  /** @dev override this */
  function _createTokenLocker(
    address tokenAddress_,
    uint256 amount_,
    uint40 unlockTime_
  ) internal virtual returns (
    uint40 id
  ) {}

  /**
   * must use createTokenLockerV2 instead
   */
  function createTokenLocker(
    address /* tokenAddress_ */,
    uint256 /* amount_ */,
    uint40 /* unlockTime_ */
  ) external virtual override {
    revert("NOT_IMPLEMENTED");
  }

  function createTokenLockerV2(
    address tokenAddress_,
    uint256 amountOrTokenId_,
    uint40 unlockTime_
  ) external payable virtual override onlyNotPaused nonReentrant returns (
    uint40 id,
    address lockAddress
  ) {
    id = _createTokenLocker(tokenAddress_, amountOrTokenId_, unlockTime_);
    lockAddress = address(this);
  }

  /** @dev this may need overriding on inherited contracts! */
  function _getTokenLockAddress(uint40 id_) internal virtual view returns (address) {
    require(id_ < _count, "Invalid id");
    return address(this);
  }

  function getTokenLockAddress(uint40 id_) external virtual override view returns (address) {
    return _getTokenLockAddress(id_);
  }

  function getTokenLockersForAddress(
    address address_
  ) external virtual override view returns (
    uint40[] memory
  ) {
    return _tokenLockersForAddress[address_];
  }

  /** @dev override this if needed */
  function getTokenLockData(uint40 /* id_ */) external virtual override view returns (
    bool /* isLpToken */,
    uint40 /* id */,
    address /* contractAddress */,
    address /* lockOwner */,
    address /* token */,
    address /* createdBy */,
    uint40 /* createdAt */,
    uint40 /* unlockTime */,
    uint256 /* balance */,
    uint256 /* totalSupply */
  ) {
    revert("NOT_IMPLEMENTED");
  }

  /** @dev override this if needed */
  function getLpData(uint40 /* id_ */) external virtual override view returns (
    bool /* hasLpData */,
    uint40 /* id */,
    address /* token0 */,
    address /* token1 */,
    uint256 /* balance0 */,
    uint256 /* balance1 */,
    uint256 /* price0 */,
    uint256 /* price1 */
  ) {
    revert("NOT_IMPLEMENTED");
  }

  /** @dev override this if needed */
  function notifyLockerOwnerChange(
    uint40 /* id_ */,
    address /* newOwner_ */,
    address /* previousOwner_ */,
    address /* createdBy_ */
  ) external virtual override {
    revert("NOT_IMPLEMENTED");
  }
}
