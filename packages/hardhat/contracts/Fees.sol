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
import { Ownable } from "./Ownable.sol";
import { IERC20 } from "./library/IERC20.sol";
import { SafeERC20 } from "./library/SafeERC20.sol";

contract Fees is IFees, Ownable {
  using SafeERC20 for IERC20;

  constructor() Ownable(_msgSender()) {
    //
    _setBaseFeeAmount(1 * (10 ** 18));
  }

  uint256 internal _baseFeeAmount;

  function _setBaseFeeAmount(uint256 amount_) private {
    _baseFeeAmount = amount_;
  }

  function setBaseFeeAmount(uint256 amount_) external {
    _setBaseFeeAmount(amount_);
  }

  /**
   * @dev if modifier_ is 100, that will equal 100 percent of the base fee amount.
   */
  function collectFees(uint256 modifier_) external {

  }
}
