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
import { FeeCollector } from "./FeeCollector.sol";
import { IStakingV1 } from "./IStakingV1.sol";
import { IStakingFactoryV1 } from "./IStakingFactoryV1.sol";

contract StakingManagerV1 is IStakingManagerV1, Governable, Pausable, IDCounter, FeeCollector {
  using Address for address payable;

  /** @dev set the deployer as both owner and governor initially */
  constructor(address factoryAddress, address payable feesAddress) Governable(_msgSender(), _msgSender()) {
    _factory = IStakingFactoryV1(factoryAddress);
    _setFeesContract(feesAddress);
    _excludedFromFees[_msgSender()] = true;
    _feeTypeAmountMap[FEE_TYPE_CREATE_STAKING] = 5 * 10 ** 17; // 0.5eth
  }

  string internal constant FEE_TYPE_CREATE_STAKING = "CreateStaking";

  IStakingFactoryV1 internal _factory;

  mapping(uint40 => IStakingV1) private _staking;
  mapping(address => uint40) private _stakingAddressMap;

  function factory() external view returns (address) {
    return address(_factory);
  }

  function setFactory(address value) external onlyOwner {
    _factory = IStakingFactoryV1(value);
  }

  function createStaking(
    address tokenAddress_,
    address rewardsTokenAddress_,
    string memory name_,
    uint16 lockDurationDays_
  ) external payable virtual override onlyNotPaused onlyCorrectFee(FEE_TYPE_CREATE_STAKING) {
    if (_msgSender() != _owner())
      _fees.sendValue(msg.value);

    uint40 id = uint40(_next());

    _staking[id] = IStakingV1(
      _factory.createStaking(
        tokenAddress_,
        rewardsTokenAddress_,
        name_,
        lockDurationDays_
      )
    );

    _stakingAddressMap[address(_staking[id])] = id;

    emit CreatedStaking(id, address(_staking[id]));
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

  function claimAll() external virtual override {
    for (uint40 i = 0; i < _count && gasleft() > 100000; i++) {
      _staking[i].claimFor(_msgSender(), false, false);
    }
  }
}
