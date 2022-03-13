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

import { IFundraisingManager } from "./IFundraisingManager.sol";
import { Fundraising } from "./Fundraising.sol";
import { Ownable } from "../Ownable.sol";
import { FeeCollector } from "../Fees/FeeCollector.sol";
import { IDCounter } from "../IDCounter.sol";
import { Pausable } from "../Pausable.sol";

contract FundraisingManager is IFundraisingManager, Ownable, FeeCollector, IDCounter, Pausable {
  constructor() Ownable(_msgSender()) {}

  mapping(uint256 => Fundraising) internal _fundraisers;

  function createFundraising(
    string memory title,
    string memory description,
    uint40 endsAt,
    uint256 successThreshold
  ) external virtual override onlyNotPaused {
    uint256 id = _next();

    _fundraisers[id] = new Fundraising(
      title,
      description,
      endsAt,
      successThreshold
    );
  }

  function getAddressById(uint256 id) external virtual view override returns (address) {
    return address(_fundraisers[id]);
  }

  function getFundraisingDataById(uint256 id) external virtual view override returns (
    string memory title,
    string memory description,
    uint40 endsAt,
    uint256 totalAmountRaised,
    uint40 numContributors
  ) {
    return _fundraisers[id].getData();
  }
}
