// SPDX-License-Identifier: UNLICENSED

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

import { Address } from "./library/Address.sol";
import { Authorizable } from "./Authorizable.sol";
import { Pausable } from "./Pausable.sol";
import { IDCounter } from "./IDCounter.sol";
import { IERC20 } from "./library/IERC20.sol";
import { ReentrancyGuard } from "./library/ReentrancyGuard.sol";
import { SafeERC20 } from "./library/SafeERC20.sol";
import { Util } from "./Util.sol";
import { Math } from "./Math.sol";

struct StakerData {
  /** contains id (uint64), block number (uint64), block timestamp (uint64) */
  uint192 lastClaimData;
  /** amount currently staked */
  uint256 amount;
  /** total amount of eth claimed */
  uint256 totalClaimed;
}

struct DepositData {
  uint256 amount;
  uint256 totalStaked;
}

contract StakingV1 is Authorizable, Pausable, IDCounter, ReentrancyGuard {
  /** libraries */
  using Address for address payable;
  using SafeERC20 for IERC20;

  /** events */
  event DepositedEth(address indexed account, uint256 amount);
  event DepositedTokens(address indexed account, uint256 amount);
  event WithdrewTokens(address indexed account, uint256 amount);
  event ClaimedRewards(address indexed account, uint256 amount);

  constructor(
    address owner_,
    address tokenAddress_,
    string memory name_,
    uint16 lockDurationDays_
  ) Authorizable(owner_) {
    //
    _token = IERC20(tokenAddress_);
    _name = name_;
    _decimals = _token.decimals();
    _lockDurationDays = lockDurationDays_;
  }

  /** @dev reference to the staked token */
  IERC20 private immutable _token;

  /** @dev name of this staking instance */
  string private _name;

  /** @dev cached copy of the staked token decimals value */
  uint8 private immutable _decimals;

  uint16 private _lockDurationDays;

  uint256 private _totalStaked;
  uint256 private _totalRewards;
  uint256 private _totalClaimed;

  /** @dev current number of stakers */
  uint64 private _currentNumStakers;

  /** @dev total number of stakers - not reduced when a staker withdraws all */
  uint64 private _totalNumStakers;

  /** @dev maximum number of stakers allowed. only impacts new stakers deposits */
  uint64 private _maxStakers = 10000;

  /** @dev used to limit the amount of gas spent during auto claim */
  uint256 private _autoClaimGasLimit = 200000;

  /** @dev current index used for auto claim iteration */
  uint64 private _autoClaimIndex;

  /** @dev account => staker data */
  mapping(address => StakerData) private _stakers;

  /** @dev id => deposit data */
  mapping(uint64 => DepositData) private _deposits;

  /** @dev this is essentially an index in the order that new users are added. */
  mapping(uint64 => address) private _autoClaimQueue;
  /** @dev reverse lookup for _autoClaimQueue. allows getting index by address */
  mapping(address => uint64) private _autoClaimQueueReverse;

  modifier autoClaimAfter {
    _;
    _autoClaim();
  }

  /**
   * @dev allow removing the lock duration, but not setting it directly.
   * this removes the possibility of creating a long lock duration after
   * people have deposited their tokens, essentially turning the staking
   * contract into a honeypot.
   *
   * removing the lock is necessary in case of emergencies,
   * like migrating to a new staking contract.
   */
  function removeLockDuration() external onlyAuthorized {
    _lockDurationDays = 0;
  }

  function setMaxStakers(uint64 value) external onlyAuthorized {
    _maxStakers = value;
  }

  function getPlaceInQueue(address account) external view returns (uint256) {
    if (_autoClaimQueueReverse[account] >= _autoClaimIndex)
      return _autoClaimQueueReverse[account] - _autoClaimIndex;

    return _totalNumStakers - (_autoClaimIndex - _autoClaimQueueReverse[account]);
  }

  function autoClaimGasLimit() external view returns (uint256) {
    return _autoClaimGasLimit;
  }

  function setAutoClaimGasLimit(uint256 value) external onlyAuthorized {
    _autoClaimGasLimit = value;
  }

  /** @return the address of the staked token */
  function token() external view returns (address) {
    return address(_token);
  }

  function getStakingData() external view returns (
    address stakedToken,
    string memory name,
    uint8 decimals,
    uint256 totalStaked,
    uint256 totalRewards,
    uint256 totalClaimed
  ) {
    stakedToken = address(_token);
    name = _name;
    decimals = _decimals;
    totalStaked = _totalStaked;
    totalRewards = _totalRewards;
    totalClaimed = _totalClaimed;
  }

  function getStakingDataForAccount(address account) external view returns (
    uint256 amount,
    uint64 lastClaimedBlock,
    uint64 lastClaimedAt,
    uint256 pendingRewards,
    uint256 totalClaimed
  ) {
    amount = _stakers[account].amount;
    lastClaimedBlock = _lastClaimBlock(account);
    lastClaimedAt = _lastClaimTime(account);
    pendingRewards = _pending(account);
    totalClaimed = _stakers[account].totalClaimed;
  }

  function _pending(address account) private view returns (uint256) {
    if (_stakers[account].amount == 0) return 0;

    uint256 pendingAmount = 0;

    // NOTE if we need to iterate through too many deposits,
    // we'll run out of gas and revert. do something about that!
    for (uint64 i = _lastClaimId(account); i < _count; i++) {
      pendingAmount += Math.mulScale(
        _deposits[i].amount,
        Math.percent(
          _stakers[account].amount,
          _deposits[i].totalStaked,
          18
        ),
        10 ** 18
      );
    }

    return pendingAmount;
  }

  function pending(address account) external view returns (uint256) {
    return _pending(account);
  }

  function _generateClaimData() private view returns (uint192) {
    uint192 claimData = uint192(uint64(_count));
    claimData |= uint192(uint64(block.number)) << 64;
    claimData |= uint192(uint64(block.timestamp)) << 128;

    return claimData;
  }

  function _claim(address account, uint192 claimData) private returns (bool) {
    uint256 pendingRewards = _pending(account);

    _stakers[account].lastClaimData = claimData;

    // if we have no pending rewards, skip
    if (pendingRewards == 0) return false;
    
    _stakers[account].totalClaimed += pendingRewards;
    _totalClaimed += pendingRewards;

    payable(account).sendValue(pendingRewards);

    emit ClaimedRewards(account, pendingRewards);

    return true;
  }

  function claimFor(address account) external nonReentrant autoClaimAfter {
    require(_claim(account, _generateClaimData()), "Claim failed");
  }

  function claim() external nonReentrant autoClaimAfter {
    require(_claim(_msgSender(), _generateClaimData()), "Claim failed");
  }

  function _deposit(address account, uint256 amount) private onlyNotPaused {
    require(amount != 0, "Deposit amount cannot be 0");

    // claim before depositing
    _claim(account, _generateClaimData());

    if (_autoClaimQueueReverse[account] == 0) {
      require(_currentNumStakers < _maxStakers, "Too many stakers");

      _totalNumStakers++;
      _currentNumStakers++;
      _autoClaimQueueReverse[account] = _totalNumStakers;
      _autoClaimQueue[_totalNumStakers] = account;
    }

    _stakers[account].amount += amount;
    _totalStaked += amount;

    // store previous balance to determine actual amount transferred
    uint256 oldBalance = _token.balanceOf(address(this));
    // make the transfer
    _token.safeTransferFrom(account, address(this), amount);
    // check for lost tokens - this is an unsupported situation currently.
    // tokens could be lost during transfer if the token has tax.
    require(
      amount == _token.balanceOf(address(this)) - oldBalance,
      "Lost tokens during transfer"
    );

    emit DepositedTokens(account, amount);
  }

  /**
   * @dev deposit amount of tokens to the staking pool.
   * reverts if tokens are lost during transfer.
   */
  function deposit(uint256 amount) external nonReentrant {
    _deposit(_msgSender(), amount);
  }

  function _getUnlockTime(address account) private view returns (uint64) {
    return _lockDurationDays == 0 ? 0 : _lastClaimTime(account) + (uint64(_lockDurationDays) * 86400);
  }

  function getUnlockTime(address account) external view returns (uint64) {
    return _getUnlockTime(account);
  }

  function _withdraw(address account, uint256 amount) private {
    require(
      _stakers[account].amount != 0 && _stakers[account].amount >= amount,
      "Attempting to withdraw too many tokens"
    );

    if (_lockDurationDays != 0) {
      require(
        block.timestamp > _getUnlockTime(account),
        "Wait for tokens to unlock before withdrawing"
      );
    }

    _claim(account, _generateClaimData());

    _stakers[account].amount -= amount;
    _totalStaked -= amount;
    if (_stakers[account].amount == 0) {
      // decrement current number of stakers
      _currentNumStakers--;
      // remove account from auto claim queue
      _autoClaimQueue[_autoClaimQueueReverse[account]] = address(0);
      _autoClaimQueueReverse[account] = 0;
    }
    // transfer eth after modifying internal state
    _token.safeTransfer(account, amount);

    emit WithdrewTokens(account, amount);
  }

  function withdraw(uint256 amount) external nonReentrant {
    _withdraw(_msgSender(), amount);
  }

  function _lastClaimId(address account) private view returns (uint64) {
    return uint64(_stakers[account].lastClaimData);
  }

  function _lastClaimBlock(address account) private view returns (uint64) {
    return uint64(_stakers[account].lastClaimData >> 64);
  }

  function _lastClaimTime(address account) private view returns (uint64) {
    return uint64(_stakers[account].lastClaimData >> 128);
  }

  function _depositEth(address account, uint256 amount) private onlyNotPaused {
    require(amount != 0, "Receive value cannot be 0");

    _totalRewards += amount;

    _deposits[uint64(_next())] = DepositData({
      amount: amount,
      totalStaked: _totalStaked
    });

    emit DepositedEth(account, amount);
  }

  /** NOTE DANGER WARNING ALERT this is for debug only! delete it! */
  function fakeDeposits(uint256 numDeposits) external onlyOwner {
    for (uint256 i = 0; i < numDeposits; i++) {
      _depositEth(_msgSender(), 10 ** 18);
    }
  }

  function _autoClaim() private {
    uint256 startingGas = gasleft();
    uint192 claimData = _generateClaimData();
    uint64 index;
    uint256 iterations = 0;

    while (startingGas - gasleft() < _autoClaimGasLimit && iterations++ < _totalNumStakers) {
      unchecked {
        index = _autoClaimIndex++;
      }

      _claim(
        _autoClaimQueue[1 + (index % _totalNumStakers)],
        claimData
      );
    }
  }

  /** @dev allow anyone to process autoClaim functionality manually */
  function processAutoClaim() external nonReentrant {
    _autoClaim();
  }

  receive() external payable nonReentrant autoClaimAfter {
    _depositEth(_msgSender(), msg.value);
  }
}
