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

import { ILaunchFactory } from "./ILaunchFactory.sol";
import { Authorizable } from "../Control/Authorizable.sol";
import { LaunchV1 } from "./LaunchV1.sol";
import { Pausable } from "../Control/Pausable.sol";

contract LaunchFactory is ILaunchFactory, Authorizable, Pausable {
  constructor() Authorizable(_msgSender()) {}

  function createLaunch(
    uint8 launchType_,
    address owner_,
    address tokenAddress_,
    uint80 times_,
    uint256 minContribution_,
    uint256 maxContribution_,
    uint256 softCap_,
    uint256 hardCap_
  ) external virtual override onlyAuthorized onlyNotPaused returns (address) {
    if (launchType_ == 0) {
      return address(new LaunchV1(
        owner_,
        tokenAddress_,
        times_,
        minContribution_,
        maxContribution_,
        softCap_,
        hardCap_
      ));
    } else {
      revert("Invalid launchType");
    }
  }
}
