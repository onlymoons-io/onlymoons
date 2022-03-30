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
import { IFundraising } from "./IFundraising.sol";
import { OwnableV2 } from "../Control/OwnableV2.sol";
import { FeeCollector } from "../Fees/FeeCollector.sol";
import { IDCounter } from "../IDCounter.sol";
import { Pausable } from "../Control/Pausable.sol";
import { IFundraisingFactory } from "./IFundraisingFactory.sol";

contract FundraisingManager is IFundraisingManager, OwnableV2, FeeCollector, IDCounter, Pausable {
  constructor() OwnableV2(_msgSender()) {}

  IFundraisingFactory internal _factory;

  mapping(uint256 => IFundraising) internal _fundraisers;

  function factory() external virtual override view returns (address) {
    return address(_factory);
  }

  function setFactoryAddress(address value) external virtual override onlyOwner {
    _factory = IFundraisingFactory(value);
  }

  function createFundraising(
    uint8 fundraisingType,
    string memory title,
    string memory description,
    uint256[] memory data
  ) external virtual override onlyNotPaused {
    uint256 id = _next();

    _fundraisers[id] = IFundraising(
      _factory.createFundraising(fundraisingType, title, description, data)
    );
  }

  function getAddressById(uint256 id) external virtual view override returns (address) {
    return address(_fundraisers[id]);
  }

  function getFundraisingDataById(uint256 id) external virtual view override returns (
    uint8 fundraisingType,
    string memory title,
    string memory description,
    uint256[] memory data,
    uint256 numContributors
  ) {
    return _fundraisers[id].getData();
  }
}
