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

import { IFundraising } from "./IFundraising.sol";
import { IFundraisingBase } from "./IFundraisingBase.sol";
import { FundraisingBase } from "./FundraisingBase.sol";

contract Fundraising is IFundraising, FundraisingBase {
  constructor(
    string memory title_,
    string memory description_,
    uint256[] memory data_
  ) FundraisingBase(title_, description_, data_) {
    require(data_[0] > block.timestamp, "Must end in the future");

    // index 0 is endsAt
    _endsAt = data_[0];
    // index 1 is successThreshold
    _successThreshold = data_[1];
    // everything after is acceptedTokens
    for (uint256 i = 2; i < data_.length; i++) {
      // convert uint256 into address by casting to uint160 first
      _acceptedTokens.push(address(uint160(data_[i])));
    }
  }

  uint256 internal immutable _endsAt;
  uint256 internal immutable _successThreshold;

  /**
   * NOTE the base class also returns 0, but every override should return a unique number
   */
  function _fundraisingType() internal virtual override view returns (uint8) {
    return 0;
  }

  function _getAdditionalData() internal virtual override view returns (uint256[] memory data) {
    data = new uint256[](2);
    data[0] = _endsAt;
    data[1] = _successThreshold;
  }

  function _setAcceptedTokens(address[] memory value) internal virtual {
    _acceptedTokens = value;
  }

  function getEndsAt() external virtual view override returns (uint256) {
    return _endsAt;
  }

  function getSuccessThreshold() external virtual view override returns (uint256) {
    return _successThreshold;
  }

  // function _claim() internal virtual override {
  //   // require(_totalAmountRaised >= _successThreshold, "Not enough raised to claim");
  //   super._claim();
  // }
}
