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

import { IIDCounter } from "../IIDCounter.sol";
import { IPausable } from "../IPausable.sol";
import { IFeeCollector } from "../Fees/IFeeCollector.sol";

interface IFundraisingManager is IIDCounter, IFeeCollector, IPausable {
  function createFundraising(
    string memory title,
    string memory description,
    uint40 endsAt,
    uint256 successThreshold
  ) external;

  function getAddressById(uint256 id) external view returns (address);

  function getFundraisingDataById(uint256 id) external view returns (
    string memory title_,
    string memory description_,
    uint40 endsAt_,
    uint256 totalAmountRaised_,
    uint40 numContributors_
  );
}
