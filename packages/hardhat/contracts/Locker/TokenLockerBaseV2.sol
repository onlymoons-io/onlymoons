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

import { ITokenLockerBaseV2 } from "./ITokenLockerBaseV2.sol";

abstract contract TokenLockerBaseV2 is ITokenLockerBaseV2 {
  /** @dev id => siteKey => url */
  mapping(uint40 => mapping(string => string)) internal _socials;

  modifier onlyLockOwner(uint40 id) {
    require(_ownerAuthorized(id), "UNAUTHORIZED");
    _;
  }

  /** @dev this is for overriding */
  function _ownerAuthorized(uint40 /* id */) internal virtual returns (bool) {
    return false;
  }

  function _setSocials(
    uint40 id_,
    string[] calldata keys_,
    string[] calldata urls_
  ) internal virtual {
    require(keys_.length == urls_.length, "ARRAY_SIZE_MISMATCH");

    for (uint256 i = 0; i < keys_.length; i++) {
      _socials[id_][keys_[i]] = urls_[i];
    }
  }

  function setSocialsById(
    uint40 id_,
    string[] calldata keys_,
    string[] calldata urls_
  ) external virtual override onlyLockOwner(id_) {
    _setSocials(id_, keys_, urls_);
  }

  function setSocials(
    string[] calldata keys_,
    string[] calldata urls_
  ) external virtual override onlyLockOwner(0) {
    _setSocials(0, keys_, urls_);
  }
}
