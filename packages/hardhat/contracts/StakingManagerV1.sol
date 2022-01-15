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
import { Governable } from "./Governable.sol";
import { Pausable } from "./Pausable.sol";
import { IDCounter } from "./IDCounter.sol";
import { StakingV1 } from "./StakingV1.sol";
import { StakingTokenV1 } from "./StakingTokenV1.sol";
import { IERC20 } from "./library/IERC20.sol";
import { ReentrancyGuard } from "./library/ReentrancyGuard.sol";

struct AccountBountyRewards {
  uint256 count;
  uint256 claimed;
}

contract StakingManagerV1 is IStakingManagerV1, Governable, Pausable, IDCounter, ReentrancyGuard {
  using Address for address payable;

  /** @dev set the deployer as both owner and governor initially */
  constructor() Governable(_msgSender(), _msgSender()) {}

  mapping(uint40 => StakingV1) private _staking;
  mapping(address => uint40) private _stakingAddressMap;

  function _createStaking(
    address tokenAddress_,
    string memory name_,
    uint16 lockDurationDays_
  ) internal virtual {
    uint40 id = uint40(_next());

    _staking[id] = new StakingV1(
      _msgSender(),
      tokenAddress_,
      name_,
      lockDurationDays_
    );

    _stakingAddressMap[address(_staking[id])] = id;

    emit CreatedStaking(id, address(_staking[id]));
  }

  function createStaking(
    address tokenAddress_,
    string memory name_,
    uint16 lockDurationDays_
  ) external virtual override onlyNotPaused {
    _createStaking(tokenAddress_, name_, lockDurationDays_);
  }

  function _createStakingToken(
    address tokenAddress_,
    address rewardsTokenAddress_,
    string memory name_,
    uint16 lockDurationDays_  
  ) internal virtual {
    uint40 id = uint40(_next());

    _staking[id] = new StakingTokenV1(
      _msgSender(),
      tokenAddress_,
      rewardsTokenAddress_,
      name_,
      lockDurationDays_
    );

    _stakingAddressMap[address(_staking[id])] = id;

    emit CreatedStaking(id, address(_staking[id]));
  }

  function createStakingToken(
    address tokenAddress_,
    address rewardsTokenAddress_,
    string memory name_,
    uint16 lockDurationDays_  
  ) external virtual override onlyNotPaused {
    _createStakingToken(tokenAddress_, rewardsTokenAddress_, name_, lockDurationDays_);
  }

  function _getStakingDataById(uint40 id) internal virtual view returns (
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

  function getStakingDataById(uint40 id) external virtual override view returns (
    address contractAddress,
    address stakedToken,
    string memory name,
    uint8 decimals,
    uint256 totalStaked,
    uint256 totalRewards,
    uint256 totalClaimed
  ){
    return _getStakingDataById(id);
  }

  function getStakingDataByAddress(address address_) external virtual override view returns (
    address contractAddress,
    address stakedToken,
    string memory name,
    uint8 decimals,
    uint256 totalStaked,
    uint256 totalRewards,
    uint256 totalClaimed
  ){
    return _getStakingDataById(_stakingAddressMap[address_]);
  }

  function getAllRewardsForAddress(address account) external virtual override view returns (uint256 pending, uint256 claimed) {
    // include total bounty rewards claimed
    // claimed = _bountyRewards[account].claimed;

    for (uint40 i = 0; i < _count && gasleft() > 50000; i++) {
      (,,uint256 amount,uint256 amountClaimed) = _staking[i].getStakingDataForAccount(account);
      pending += amount;
      claimed += amountClaimed;
    }
  }

  function _claimAll(address account, bool revertOnFailure, bool doAutoClaim) internal virtual {
    for (uint40 i = 0; i < _count && gasleft() > 100000; i++) {
      _staking[i].claimFor(account, revertOnFailure, doAutoClaim);
    }
  }

  function claimAll() external virtual override nonReentrant {
    _claimAll(_msgSender(), false, false);
  }
}
