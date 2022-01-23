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

import { IFeeCollector } from "./IFeeCollector.sol";
import { Governable } from "./Governable.sol";

abstract contract FeeCollector is IFeeCollector, Governable {
  address payable internal _fees;

  mapping(string => uint256) internal _feeTypeAmountMap;
  mapping(address => bool) internal _excludedFromFees;

  modifier onlyCorrectFee(string memory feeType) {
    require(_excludedFromFees[_msgSender()] || _feeTypeAmountMap[feeType] == msg.value, "Incorrect fee");
    _;
  }

  function setAddressExemptFromFees(address account, bool value) external override onlyOwner {
    _excludedFromFees[account] = value;
  }

  function isAddressExemptFromFees(address account) external view override returns (bool) {
    return _excludedFromFees[account];
  }

  /**
   * @return 0 if the msg sender is exempt from fees.
   * this may not be desired when checking current fee values.
   */
  function getFeeAmountForType(string memory feeType) external view override returns (uint256) {
    return _excludedFromFees[_msgSender()] ? 0 : _feeTypeAmountMap[feeType];
  }

  function setFeeAmountForType(string memory feeType, uint256 amount) external override onlyGovernor {
    _feeTypeAmountMap[feeType] = amount;
  }

  function feesContract() external view override returns (address) {
    return _fees;
  }

  function _setFeesContract(address payable contractAddress_) internal virtual {
    _fees = contractAddress_;
  }

  function setFeesContract(address payable contractAddress_) external override onlyOwner {
    _setFeesContract(contractAddress_);
  }
}
