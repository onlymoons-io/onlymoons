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

import { IIDCounter } from "./IIDCounter.sol";

interface IStakingManagerV1 is IIDCounter {
  event CreatedStaking(uint40 indexed id, address contractAddress);
  // event DepositedEth(address indexed account, uint256 amount);
  // event DistributedRewards(
  //   address indexed account,
  //   uint256 soloStakingRewards,
  //   uint256 lpStakingRewards,
  //   uint256 distributorReward
  // );

  function rewardsMode() external view returns (uint8);
  function setRewardsMode(uint8 value) external;
  function rewardForDistributing() external view returns (uint16);
  function setRewardForDistributing(uint16 value) external;
  function setRewardsForDistribution(uint256 min, uint256 max) external;
  function getRewardsForDistribution() external view returns (uint256 min, uint256 max);
  function setDistributionCooldown(uint256 sec) external;
  function setSoloStakingId(uint40 id) external;
  function setLpStakingId(uint40 id) external;
  function createStaking(
    address tokenAddress_,
    string memory name_,
    uint16 lockDurationDays_
  ) external;
  function getStakingData(uint40 id) external view returns (
    address contractAddress,
    address stakedToken,
    string memory name,
    uint8 decimals,
    uint256 totalStaked,
    uint256 totalRewards,
    uint256 totalClaimed
  );
  function getGlobalStakingData() external view returns (
    bool ready,
    address mainToken,
    uint40 soloStakingId,
    uint40 lpStakingId,
    uint16 liquidityRatio,
    uint16 rewardsRatio
  );
  function getLiquidityRatio() external view returns (uint16);
  function getRewardsRatio() external view returns (uint16);
  function getAvailableRewards() external view returns (uint256);
  function distribute() external;
  function canDistribute() external view returns (bool);
  function getStakingRewards() external view returns (
    uint256 combinedRewards,
    uint256 soloStakingRewards,
    uint256 lpStakingRewards,
    uint256 distributorReward,
    uint256 totalRewards,
    uint256 waitingRewards,
    uint256 lastDistributionAt
  );
  function getAllRewardsForAddress(address account) external view returns (uint256 pending, uint256 claimed);
  function getSplitStakingRewardsForAddress(address account) external view returns (uint256 pending, uint256 claimed);
  function claimAll() external;
  function claimSplitStaking() external;
}
