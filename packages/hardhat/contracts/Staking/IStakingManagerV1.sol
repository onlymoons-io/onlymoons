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

import { IGovernable } from "../Governance/IGovernable.sol";
import { IPausable } from "../Control/IPausable.sol";
import { IIDCounter } from "../IIDCounter.sol";
import { IFeeCollector } from "../Fees/IFeeCollector.sol";

interface IStakingManagerV1 is IGovernable, IPausable, IIDCounter, IFeeCollector {
  event CreatedStaking(uint40 indexed id, address contractAddress);

  function gasLeftLimit() external view returns (uint256);
  function setGasLeftLimit(uint256 value) external;
  function factory() external view returns (address);
  function setFactory(address value) external;
  function createStaking(
    uint8 stakingType_,
    address tokenAddress_,
    uint16 lockDurationDays_,
    uint256[] memory typeData_
  ) external payable;
  function getStakingDataByAddress(address address_) external view returns (
    address contractAddress,
    uint8 stakingType,
    address stakedToken,
    uint8 decimals,
    uint256 totalStaked,
    uint256 totalRewards,
    uint256 totalClaimed
  );
  function getStakingDataById(uint40 id) external view returns (
    address contractAddress,
    uint8 stakingType,
    address stakedToken,
    uint8 decimals,
    uint256 totalStaked,
    uint256 totalRewards,
    uint256 totalClaimed
  );
  function getAllRewardsForAddress(address account) external view returns (uint256 pending, uint256 claimed);
  function claimAll() external;
}
