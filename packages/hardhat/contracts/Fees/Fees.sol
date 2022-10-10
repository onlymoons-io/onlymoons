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

import { IFees } from "./IFees.sol";
import { Address } from "../library/Address.sol";
import { Governable } from "../Governance/Governable.sol";
import { Pausable } from "../Control/Pausable.sol";

contract Fees is IFees, Governable, Pausable {
  using Address for address payable;

  constructor(
    uint256 feeAmountBase_,
    address payable treasuryFeeAddress_,
    address payable stakingFeeAddress_
  ) Governable(_msgSender(), _msgSender()) {
    _feeAmountBase = feeAmountBase_;
    _treasuryFeeAddress = treasuryFeeAddress_;
    _stakingFeeAddress = stakingFeeAddress_;
    _exemptFromFees[_msgSender()] = true;

    // !!! setup some fee type presets

    // note this covers all staking contracts.
    _feeTypeAmountMap["DeployStaking"] = 300;
    _feeTypeAmountMap["DeployToken"] = 200;
    _feeTypeAmountMap["CreateTokenLock"] = 200;
    _feeTypeAmountMap["CreateInfiniteLock"] = 100;
    _feeTypeAmountMap["SplitLock"] = 100;
    _feeTypeAmountMap["MigrateLock"] = 100;
  }

  address payable internal _treasuryFeeAddress;
  address payable internal _stakingFeeAddress;

  /** 0-10000 - 2 decimals of precision. all fees should add up to 10000 (100%) */
  // send all to treasury by default, since staking will be implemented later
  uint16 internal _treasuryFee = 10000;
  uint16 internal _stakingFee = 0;

  uint256 internal _treasuryFeesDistributed;
  uint256 internal _stakingFeesDistributed;

  uint256 internal _feeAmountBase;

  mapping(address => bool) internal _exemptFromFees;
  mapping(string => uint256) internal _feeTypeAmountMap;

  function feeAmountBase() external virtual override view returns (uint256) {
    return _feeAmountBase;
  }

  function setFeeAmountBase(uint256 value) external virtual override onlyGovernor {
    _feeAmountBase = value;
  }

  /**
   * @return 0 if the msg sender is exempt from fees.
   */
  function getFeeAmountForType(string calldata feeType) external view override returns (uint256) {
    return _exemptFromFees[_msgSender()] ? 0 : _feeAmountBase * _feeTypeAmountMap[feeType];
  }

  function setFeeAmountForType(string calldata feeType, uint256 amount) external override onlyGovernor {
    _feeTypeAmountMap[feeType] = amount;
  }

  function setAddressExemptFromFees(address account, bool value) external override onlyOwner {
    _exemptFromFees[account] = value;
  }

  function isAddressExemptFromFees(address account) external view override returns (bool) {
    return _exemptFromFees[account];
  }

  function feesDistributed() external view override returns (uint256 total, uint256 treasury, uint256 staking) {
    treasury = _treasuryFeesDistributed;
    staking = _stakingFeesDistributed;
    total = _treasuryFeesDistributed + _stakingFeesDistributed;
  }

  function treasuryFeeAddress() external view override returns (address) {
    return _treasuryFeeAddress;
  }

  function setTreasuryFeeAddress(address payable value) external override onlyOwner {
    _treasuryFeeAddress = value;
  }

  function stakingFeeAddress() external view override returns (address) {
    return _stakingFeeAddress;
  }

  function setStakingFeeAddress(address payable value) external override onlyOwner {
    _stakingFeeAddress = value;
  }

  function getFees() external view override returns (uint16 treasury, uint16 staking) {
    treasury = _treasuryFee;
    staking = _stakingFee;
  }

  /** 0-10000 - 2 decimals of precision. all fees should add up to 10000 (100.00%) */
  function setFees(uint16 treasury, uint16 staking) external override onlyGovernor {
    require(treasury + staking == 10000, "Total fees must equal 10000");

    _treasuryFee = treasury;
    _stakingFee = staking;
  }

  function _distributeFees(uint256 amount) internal virtual {
    require(amount != 0, "Cannot distribute 0");

    // explicitly check for 0% fee to avoid any chance of
    // precision errors when one of the fees is disabled.
    uint256 treasuryAmount = _treasuryFee == 0 ? 0 : (amount * _treasuryFee / 10000);
    uint256 stakingAmount = _stakingFee == 0 ? 0 : (amount - treasuryAmount);

    if (treasuryAmount != 0) {
      _treasuryFeesDistributed += treasuryAmount;
      _treasuryFeeAddress.sendValue(treasuryAmount);
    }
    
    if (stakingAmount != 0) {
      _stakingFeesDistributed += stakingAmount;
      _stakingFeeAddress.sendValue(stakingAmount);
    }
  }

  /**
   * @dev allow incoming fees to be paused in case of emergency.
   * sending fees here while paused will result in a reverted tx.
   */
  receive() external payable virtual onlyNotPaused {
    _distributeFees(msg.value);
  }
}
