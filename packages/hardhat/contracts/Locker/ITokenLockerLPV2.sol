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

import { ITokenLockerManagerV2 } from "./ITokenLockerManagerV2.sol";
import { ITokenLockerBaseV2 } from "./ITokenLockerBaseV2.sol";
// import { ITokenLockerERC20V2 } from "./ITokenLockerERC20V2.sol";


interface ITokenLockerLPV2 is ITokenLockerManagerV2, ITokenLockerBaseV2 /* ITokenLockerERC20V2 */ {
  event Extended(uint40 id, uint40 newUnlockTime);
  event Deposited(uint40 id, uint256 amountOrTokenId);
  event Withdrew(uint40 id);
  event LockOwnershipTransfered(
    uint40 id,
    address oldOwner,
    address newOwner
  );

  function startUnlockCountdown(
    uint40 id_
  ) external;
  function withdrawById(
    uint40 id_
  ) external;
}
