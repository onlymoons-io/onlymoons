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

import { IStakingManagerV1 } from "./IStakingManagerV1.sol";
import { Address } from "./library/Address.sol";
import { Authorizable } from "./Authorizable.sol";
import { Pausable } from "./Pausable.sol";
import { IDCounter } from "./IDCounter.sol";
import { StakingV1 } from "./StakingV1.sol";
import { Math } from "./Math.sol";
import { IERC20 } from "./library/IERC20.sol";
import { ReentrancyGuard } from "./library/ReentrancyGuard.sol";

contract StakingManagerV1 is IStakingManagerV1, Authorizable, Pausable, IDCounter, ReentrancyGuard {
  using Address for address payable;

  constructor() Authorizable(_msgSender()) {
    // use a real value for this, but make sure to subtract
    // the cooldown duration so we can immediately distribute
    // _lastDistributionAt = block.timestamp - _distributionCooldown;
  }

  uint40 private constant UNSET_ID = type(uint40).max;

  uint40 private _soloStakingId = UNSET_ID;
  uint40 private _lpStakingId = UNSET_ID;

  IERC20 private _soloStakingToken;
  IERC20 private _lpStakingToken;

  /** @dev 0-10000 based percent for fee rewarded for distributing */
  uint16 private _rewardForDistributing = 200; // 2%

  uint256 private _distributionRewardRate = 1000 * 10 ** 10;
  uint256 private _distributionRewardRateTimeModifier = 2;

  uint256 private _totalRewards = 0;
  uint256 private _waitingRewards = 0;
  uint256 private _distributedRewards = 0;
  uint256 private _cachedRewards = 0;

  /** @dev if this is too low, the gas cost of distributing will be greater than the reward */
  uint256 private _minimumRewardsForDistribution = 1; // 1 * 10 ** 17; // 0.1 eth
  /** @dev if this is too high, this contract might run out of rewards too quickly */
  uint256 private _maximumRewardsForDistribution = 35 * 10 ** 16; // 0.35 eth
  /** @dev start this at a low value for testing, since waiting is no good. increase this on mainnets */
  uint256 private _distributionCooldown = 0 minutes;
  uint256 private _lastDistributionAt = 0;
  uint256 private _lastDepositAt = 0;

  /** @dev 0 = auto, 1 = only lp, 2 = only solo */
  uint8 private _rewardsMode = 0;

  mapping(uint40 => StakingV1) private _staking;

  /** @dev 0 = auto, 1 = only lp, 2 = only solo */
  function rewardsMode() external view override returns (uint8) {
    return _rewardsMode;
  }

  /** @dev 0 = auto, 1 = only lp, 2 = only solo */
  function setRewardsMode(uint8 value) external override onlyAuthorized {
    require(value <= 2, "Invalid rewardsMode value");

    _rewardsMode = value;
  }

  function rewardForDistributing() external view override returns (uint16) {
    return _rewardForDistributing;
  }

  function setRewardForDistributing(uint16 value) external override onlyAuthorized {
    // hard cap reward at 10%, which is probably higher than it ever should be
    _rewardForDistributing = value < 1000 ? value : 1000;
  }

  function distributionRewardRate() external view returns (
    uint256 rate,
    uint256 timeModifier
  ) {
    rate = _distributionRewardRate;
    timeModifier = _distributionRewardRateTimeModifier;
  }

  function setDistributionRewardRate(
    uint256 distributionRewardRate_,
    uint256 distributionRewardRateTimeModifier_
  ) external onlyAuthorized {
    _distributionRewardRate = distributionRewardRate_;
    _distributionRewardRateTimeModifier = distributionRewardRateTimeModifier_;
  }

  function setRewardsForDistribution(uint256 min, uint256 max) external override onlyAuthorized {
    _minimumRewardsForDistribution = min;
    _maximumRewardsForDistribution = max;
  }

  /**
   * @dev this is here for public visibility.
   */
  function getRewardsForDistribution() external override view returns (uint256 min, uint256 max) {
    min = _minimumRewardsForDistribution;
    max = _maximumRewardsForDistribution;
  }

  function setDistributionCooldown(uint256 sec) external override onlyAuthorized {
    _distributionCooldown = sec;
  }

  function setSoloStakingId(uint40 id) external override onlyOwner {
    _soloStakingId = id;

    (address stakedToken,,,,,) = _staking[_soloStakingId].getStakingData();

    _soloStakingToken = IERC20(stakedToken);
  }

  function setLpStakingId(uint40 id) external override onlyOwner {
    _lpStakingId = id;

    (address stakedToken,,,,,) = _staking[_lpStakingId].getStakingData();

    _lpStakingToken = IERC20(stakedToken);
  }

  function _ready() private view returns (bool) {
    return _soloStakingId != UNSET_ID && _lpStakingId != UNSET_ID;
  }

  function _createStaking(
    address tokenAddress_,
    string memory name_,
    uint16 lockDurationDays_
  ) private {
    uint40 id = uint40(_next());

    _staking[id] = new StakingV1(
      _msgSender(),
      tokenAddress_,
      name_,
      lockDurationDays_
    );

    emit CreatedStaking(id, address(_staking[id]));
  }

  function createStaking(
    address tokenAddress_,
    string memory name_,
    uint16 lockDurationDays_
  ) external override onlyOwner onlyNotPaused {
    _createStaking(tokenAddress_, name_, lockDurationDays_);
  }

  function getStakingData(uint40 id) external view override returns (
    address contractAddress,
    address stakedToken,
    string memory name,
    uint8 decimals,
    uint256 totalStaked,
    uint256 totalRewards,
    uint256 totalClaimed
  ){
    (
      stakedToken,
      name,
      decimals,
      totalStaked,
      totalRewards,
      totalClaimed
    ) = _staking[id].getStakingData();

    contractAddress = address(_staking[id]);
  }

  function getGlobalStakingData() external view override returns (
    bool ready,
    address mainToken,
    uint40 soloStakingId,
    uint40 lpStakingId,
    uint16 liquidityRatio,
    uint16 rewardsRatio
  ) {
    ready = _ready();
    mainToken = address(_soloStakingToken);
    soloStakingId = _soloStakingId;
    lpStakingId = _lpStakingId;
    liquidityRatio = _getLiquidityRatio();
    rewardsRatio = _getRewardsRatio();
  }

  function _getLiquidityRatio() private view returns (uint16) {
    if (!_ready()) {
      return 1000;
    }

    uint256 ratio = _soloStakingToken.balanceOf(address(_lpStakingToken)) * 10000 / _soloStakingToken.totalSupply();
    return uint16(ratio < 10000 ? ratio : 10000);
  }

  function getLiquidityRatio() external view override returns (uint16) {
    return _getLiquidityRatio();
  }

  function _getRewardsRatio() private view returns (uint16) {
    uint16 liquidityRatio = _getLiquidityRatio();

    return liquidityRatio <= 1000
      ? liquidityRatio * 5
      : 5000 + ((liquidityRatio - 1000) / 2);
  }

  function getRewardsRatio() external view override returns (uint16) {
    return _getRewardsRatio();
  }

  function _getAvailableRewards() private view returns (uint256) {
    // this dynamic rewards bit could be exploited by watching
    // for big deposits, and then scripting a call to distribute immediately
    // uint256 rewards = Math.mulScale(
    //   _waitingRewards,
    //   (block.timestamp - _lastDistributionAt) * _distributionRewardRate,
    //   10 ** 18
    // );

    uint256 rewards = _cachedRewards + ((block.timestamp - _getMostRecentDepositOrDistribution()) * _distributionRewardRate);

    return rewards < _minimumRewardsForDistribution
      ? 0
      : rewards > _waitingRewards
      ? _waitingRewards
      : rewards > _maximumRewardsForDistribution
      ? _maximumRewardsForDistribution
      : rewards;
  }

  function _getMostRecentDepositOrDistribution() private view returns (uint256) {
    return _lastDistributionAt > _lastDepositAt ? _lastDistributionAt : _lastDepositAt;
  }

  function getAvailableRewards() external view override returns (uint256) {
    return _getAvailableRewards();
  }

  function _canDistribute() private view returns (bool) {
    return (
      (
        _rewardsMode == 0 && _ready()
      ) || (
        _rewardsMode == 1 && _lpStakingId != UNSET_ID
      ) || (
        _rewardsMode == 2 && _soloStakingId != UNSET_ID
      )
    ) && _getAvailableRewards() >= _minimumRewardsForDistribution;
  }

  function canDistribute() external view override returns (bool) {
    return _canDistribute();
  }

  function _getStakingRewards(bool includeDistributorReward) private view returns (
    uint256 combinedRewards,
    uint256 soloStakingRewards,
    uint256 lpStakingRewards,
    uint256 distributorReward,
    uint256 totalRewards,
    uint256 waitingRewards,
    uint256 lastDistributionAt
  ){
    lastDistributionAt = _lastDistributionAt;
    totalRewards = _totalRewards;
    waitingRewards = _waitingRewards;
    combinedRewards = _getAvailableRewards();
    
    if (combinedRewards != 0) {
      distributorReward = includeDistributorReward
        ? Math.mulScale(combinedRewards, _rewardForDistributing, 10000)
        : 0;
      
      uint256 leftoverRewards = combinedRewards - distributorReward;

      if (_rewardsMode == 1) {
        // give all rewards to lp staking when rewardsMode == 1
        lpStakingRewards = leftoverRewards;
      } else if (_rewardsMode == 2) {
        // give all rewards to solo staking when rewardsMode == 2
        soloStakingRewards = leftoverRewards;
      } else {
        // automatically distribute rewards between solo & lp staking
        soloStakingRewards = Math.mulScale(leftoverRewards, _getRewardsRatio(), 10000);
        lpStakingRewards = leftoverRewards - soloStakingRewards;
      }
    }
  }

  function getStakingRewards() external view override returns (
    uint256 combinedRewards,
    uint256 soloStakingRewards,
    uint256 lpStakingRewards,
    uint256 distributorReward,
    uint256 totalRewards,
    uint256 waitingRewards,
    uint256 lastDistributionAt
  ){
    return _getStakingRewards(true);
  }

  function _distribute(address payable distributor) private {
    require(_canDistribute(), "Could not distribute");

    (
      uint256 combinedRewards,
      uint256 soloStakingRewards,
      uint256 lpStakingRewards,
      uint256 distributorReward,,,
    // contracts are exempt from receiving rewards - sorry
    ) = _getStakingRewards(!distributor.isContract());

    require(combinedRewards != 0, "No rewards to distribute");

    _cachedRewards = 0;

    // keep track of the last timestamp that we're distributing rewards,
    // so we can use the cooldown feature to limit the number of rewards transactions.
    _lastDistributionAt = block.timestamp;

    _waitingRewards -= combinedRewards;

    if (soloStakingRewards != 0)
      payable(address(_staking[_soloStakingId])).sendValue(soloStakingRewards);
    if (lpStakingRewards != 0)
      payable(address(_staking[_lpStakingId])).sendValue(lpStakingRewards);
    if (distributorReward != 0)
      distributor.sendValue(distributorReward);
    
    emit DistributedRewards(
      distributor,
      soloStakingRewards,
      lpStakingRewards,
      distributorReward
    );
  }

  function distribute() external override nonReentrant {
    _distribute(payable(_msgSender()));
  }

  function getAllRewardsForAddress(address account) external view override returns (uint256) {
    uint256 totalPending = 0;

    for (uint40 i = 0; i < _count; i++) {
      totalPending += _staking[i].pending(account);
    }

    return totalPending;
  }

  function _claimAll(address account) private {
    for (uint40 i = 0; i < _count; i++) {
      if (_staking[i].pending(account) != 0) {
        _staking[i].claimFor(account);
      }
    }
  }

  function claimAll() external override nonReentrant {
    _claimAll(_msgSender());
  }

  function _depositEth(address account, uint256 amount) private onlyNotPaused {
    require(amount != 0, "Receive value cannot be 0");
    require(_ready(), "Split staking is not ready");

    if (_waitingRewards == 0) {
      _lastDistributionAt = block.timestamp;
    }

    _cachedRewards = _getAvailableRewards();

    _lastDepositAt = block.timestamp;

    _totalRewards += amount;
    _waitingRewards += amount;

    emit DepositedEth(account, amount);
  }

  /**
   * @dev receive eth for split staking rewards
   */
  receive() external payable nonReentrant {
    _depositEth(_msgSender(), msg.value);
  }
}
