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

import { ITokenLockerManagerV1 } from "../ITokenLockerManagerV1.sol";
import { IGovernable } from "../Governance/IGovernable.sol";
import { IPausable } from "../Control/IPausable.sol";
import { IIDCounter } from "../IIDCounter.sol";

interface ITokenLockerManagerV2 is ITokenLockerManagerV1, IGovernable, IPausable, IIDCounter {
  /**
   * @dev this should have been in ITokenLockerManagerV1,
   * but it wound up in TokenLockerManagerV1. define it here instead.
   */
  event TokenLockerCreated(
    uint40 id,
    address indexed token,
    /** @dev LP token pair addresses - these will be address(0) for regular tokens */
    address indexed token0,
    address indexed token1,
    address createdBy,
    uint256 balance,
    uint40 unlockTime
  );

  event LockOwnershipTransfered(
    uint40 id,
    address oldOwner,
    address newOwner
  );

  function factory() external returns (address);

  function setFactory(address address_) external;

  function createTokenLockerWithReturnValue(
    address tokenAddress_,
    uint256 amount_,
    uint40 unlockTime_
  ) external returns (
    uint40 id,
    address lockAddress
  );

  function transferLockOwnership(uint40 id_, address newOwner_) external;
}
