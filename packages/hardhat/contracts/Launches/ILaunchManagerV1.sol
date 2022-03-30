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
import { IFeeCollector } from "../Fees/IFeeCollector.sol";
import { IGovernable } from "../Governance/IGovernable.sol";
import { IPausable } from "../Control/IPausable.sol";

interface ILaunchManagerV1 is IIDCounter, IFeeCollector, IGovernable, IPausable {
  function createLaunch(
    address tokenAddress_,
    uint80 times_,
    uint256 minContribution_,
    uint256 maxContribution_,
    uint256 softCap_,
    uint256 hardCap_,
    uint256 amount_
  ) external;

  function getLaunchBaseData(uint40 id) external view returns (
    address token,
    string memory name,
    string memory symbol,
    uint8 decimals,
    string memory icon,
    uint120 times,
    uint256 balance,
    uint256 softCap,
    uint256 hardCap
  );
}
