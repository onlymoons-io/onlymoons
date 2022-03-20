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

import { IFundraisingFactory } from "./IFundraisingFactory.sol";
import { Fundraising } from "./Fundraising.sol";
import { Authorizable } from "../Control/Authorizable.sol";
import { Pausable } from "../Control/Pausable.sol";
import { Fundraising } from "./Fundraising.sol";

contract FundraisingFactory is IFundraisingFactory, Authorizable, Pausable {
  constructor() Authorizable(_msgSender()) {}

  /**
   * @param fundraisingType 0 = supports endsAt, successThreshold, and acceptedTokens
   * @param title publicly visible title of the fundraiser
   * @param description publicly visible description of the fundraiser
   * @param data additional data for various types of fundraiser contracts
   *
   * @return contract address of deployed fundraising contract
   *
   * NOTE only fundraisingType: 0 is supported for now, but using a factory
   * allows us to redeploy the factory to modify or add new types without redeploying the manager.
   */
  function _createFundraising(
    uint8 fundraisingType,
    string memory title,
    string memory description,
    uint256[] memory data
  ) internal virtual returns (address) {
    if (fundraisingType == 0) {
      return address(new Fundraising(title, description, data));
    }

    return address(0);
  }

  /**
   * @param fundraisingType 0 = supports endsAt, successThreshold, and acceptedTokens
   * @param title publicly visible title of the fundraiser
   * @param description publicly visible description of the fundraiser
   * @param data additional data for various types of fundraiser contracts
   *
   * @return contract address of deployed fundraising contract
   *
   * NOTE only fundraisingType: 0 is supported for now, but using a factory
   * allows us to redeploy the factory to modify or add new types without redeploying the manager.
   */
  function createFundraising(
    uint8 fundraisingType,
    string memory title,
    string memory description,
    uint256[] memory data
  ) external virtual override onlyAuthorized returns (address) {
    address deployed = _createFundraising(fundraisingType, title, description, data);
    require(deployed != address(0), "Failed to deploy");
    return deployed;
  }
}
