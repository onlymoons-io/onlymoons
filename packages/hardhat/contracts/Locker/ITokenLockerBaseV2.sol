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

import { IOwnableV2 } from "../Control/IOwnableV2.sol";
import { IFeeCollector } from "../Fees/IFeeCollector.sol";

interface ITokenLockerBaseV2 is IOwnableV2, IFeeCollector {
  event LockOwnershipTransfered(
    uint40 indexed id,
    address indexed oldOwner,
    address indexed newOwner
  );

  function setSocials(
    uint40 id_,
    string[] calldata keys_,
    string[] calldata urls_
  ) external;
  function getUrlForSocialKey(
    uint40 id_,
    string calldata key_
  ) external view returns (
    string memory
  );
  function withdraw() external;
  function deposit(
    uint40 id_,
    uint256 amountOrTokenId_,
    uint40 newUnlockTime_
  ) external;
  function startUnlockCountdown(
    uint40 id_
  ) external;
  function transferLockOwnership(
    uint40 id_,
    address newOwner_
  ) external;
}
