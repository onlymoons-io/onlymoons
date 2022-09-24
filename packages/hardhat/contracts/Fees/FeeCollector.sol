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

import { IFeeCollector } from "./IFeeCollector.sol";
import { Address } from "../library/Address.sol";
import { IFees } from "./IFees.sol";
import { OwnableV2 } from "../Control/OwnableV2.sol";

abstract contract FeeCollector is IFeeCollector, OwnableV2 {
  using Address for address payable;

  IFees internal _fees;

  modifier takeFee(string memory feeType) {
    _takeFee(feeType);
    _;
  }

  function _takeFee(string memory feeType) internal {
    require(_fees.getFeeAmountForType(feeType) == msg.value, "Incorrect fee");
    if (!_fees.isAddressExemptFromFees(_msgSender()))
      payable(address(_fees)).sendValue(msg.value);
  }

  function feesContract() external view override returns (address) {
    return address(_fees);
  }

  function _setFeesContract(address contractAddress) internal virtual {
    _fees = IFees(contractAddress);
  }

  function setFeesContract(address contractAddress) external override onlyOwner {
    _setFeesContract(contractAddress);
  }
}
