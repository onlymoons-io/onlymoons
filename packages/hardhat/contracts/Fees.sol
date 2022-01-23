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

import { IFees } from "./IFees.sol";
import { Address } from "./library/Address.sol";
import { Governable } from "./Governable.sol";
import { Pausable } from "./Pausable.sol";

contract Fees is IFees, Governable, Pausable {
  using Address for address payable;

  constructor(address payable treasuryFeeAddress_, address payable stakingFeeAddress_) Governable(_msgSender(), _msgSender()) {
    _treasuryFeeAddress = treasuryFeeAddress_;
    _stakingFeeAddress = stakingFeeAddress_;
  }

  address payable internal _treasuryFeeAddress;
  address payable internal _stakingFeeAddress;

  /** 0-10000 - 2 decimals of precision. all fees should add up to 10000 (100%) */
  uint16 internal _treasuryFee = 1000;
  uint16 internal _stakingFee = 9000;

  uint256 internal _treasuryFeesDistributed;
  uint256 internal _stakingFeesDistributed;

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

  /** 0-10000 - 2 decimals of precision. all fees should add up to 10000 (100%) */
  function setFees(uint16 treasury, uint16 staking) external override onlyGovernor {
    require(treasury + staking == 10000, "Total fees must equal 10000");

    _treasuryFee = treasury;
    _stakingFee = staking;
  }

  function _distributeFees(uint256 amount) internal virtual {
    require(amount != 0, "Balance is 0");

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
