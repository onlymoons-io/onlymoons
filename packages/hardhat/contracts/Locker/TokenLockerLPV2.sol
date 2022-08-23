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

import { ITokenLockerLPV2 } from "./ITokenLockerLPV2.sol";
import { ITokenLockerBaseV2 } from "./ITokenLockerBaseV2.sol";
import { ITokenLockerManagerV1 } from "../ITokenLockerManagerV1.sol";
import { ITokenLockerManagerV2 } from "./ITokenLockerManagerV2.sol";
import { TokenLockerManagerV2 } from "./TokenLockerManagerV2.sol";
import { TokenLockerBaseV2 } from "./TokenLockerBaseV2.sol";

abstract contract TokenLockerLPV2 is ITokenLockerLPV2, TokenLockerManagerV2, TokenLockerBaseV2 {
  function setSocials(
    string[] calldata /* sites_ */,
    string[] calldata /* urls_ */
  ) external virtual override(
    ITokenLockerBaseV2,
    TokenLockerBaseV2
  ){
    revert("NOT_IMPLEMENTED");
  }

  function withdraw() external virtual override {
    revert("NOT_IMPLEMENTED");
  }

  function factory() external virtual override(
    ITokenLockerManagerV2,
    TokenLockerManagerV2
  ) pure returns (address) {
    return address(0);
  }

  function setFactory(
    address /* address_ */
  ) external virtual override(
    ITokenLockerManagerV2,
    TokenLockerManagerV2
  ) onlyOwner {
    revert("NOT_IMPLEMENTED");
  }

  function notifyLockerOwnerChange(
    uint40 /* id_ */,
    address /* newOwner_ */,
    address /* previousOwner_ */,
    address /* createdBy_ */
  ) external virtual override(
    ITokenLockerManagerV1,
    TokenLockerManagerV2
  ){
    revert("NOT_IMPLEMENTED");
  }

  /** @dev override this in implementations, because uni v2/v3 locks use different structs */
  function _transferLockOwnership(uint40 id_, address newOwner_) internal virtual {}

  function transferLockOwnership(
    uint40 id_,
    address newOwner_
  ) external virtual override(
    ITokenLockerManagerV2,
    TokenLockerManagerV2
  ){
    _transferLockOwnership(id_, newOwner_);
  }
}
