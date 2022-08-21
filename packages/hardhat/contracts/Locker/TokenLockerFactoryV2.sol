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

import { ITokenLockerFactoryV2 } from "./ITokenLockerFactoryV2.sol";
import { Authorizable } from "../Control/Authorizable.sol";
import { TokenLockerBaseV2 } from "./TokenLockerBaseV2.sol";
import { TokenLockerLPV2 } from "./TokenLockerLPV2.sol";

contract TokenLockerFactoryV2 is ITokenLockerFactoryV2, Authorizable {
  constructor() Authorizable(_msgSender()) {
    //
  }

  function _createUniV2LPLocker(
    address managerAddress_,
    uint40 lockId_,
    bytes calldata extraData_
  ) internal returns (address lockAddress) {

  }

  function _createUniV3LPLocker(
    address managerAddress_,
    uint40 lockId_,
    bytes calldata extraData_
  ) internal returns (address lockAddress) {

  }

  function _createERC721Locker(
    address managerAddress_,
    uint40 lockId_,
    bytes calldata extraData_
  ) internal returns (address lockAddress) {

  }

  function _createERC20Locker(
    address managerAddress_,
    uint40 lockId_,
    bytes calldata extraData_
  ) internal returns (address lockAddress) {

  }

  /**
   * @param lockType_ 0 = uniswap v2 lp token, 1 = uniswap v3 lp position nft, 2 = erc721 nft, 3 = erc20 token
   * @param managerAddress_ address of the TokenLockerManagerV2 instance that created the lock
   * @param lockId_ numeric id of this lock in the TokenLockerManagerV2 instance
   * @param extraData_ additional data depending on lock type
   */
  function createLocker(
    uint8 lockType_,
    address managerAddress_,
    uint40 lockId_,
    bytes calldata extraData_
  ) external returns (address lockAddress) {
    require(lockType_ < 4, "Invalid lock type");

    if (lockType_ == 0) {
      return _createUniV2LPLocker(managerAddress_, lockId_, extraData_);
    } else if (lockType_ == 1) {
      return _createUniV3LPLocker(managerAddress_, lockId_, extraData_);
    } else if (lockType_ == 2) {
      return _createERC721Locker(managerAddress_, lockId_, extraData_);
    } else { // if lockType_ == 3
      return _createERC20Locker(managerAddress_, lockId_, extraData_);
    }
  }
}
