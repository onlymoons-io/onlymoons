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
import { ReentrancyGuard } from "../library/ReentrancyGuard.sol";

abstract contract TokenLockerBaseV2 is ITokenLockerBaseV2, ReentrancyGuard {
  /** @dev id => siteKey => url */
  mapping(uint40 => mapping(string => string)) internal _socials;

  modifier onlyLockOwner(uint40 id_) {
    require(_isLockOwner(id_), "UNAUTHORIZED");
    _;
  }

  /** @dev override this */
  function _isLockOwner(uint40 id_) internal virtual view returns (bool) {}

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

  function setSocials(
    uint40 id_,
    string[] calldata keys_,
    string[] calldata urls_
  ) external virtual override onlyLockOwner(id_) {
    _setSocials(id_, keys_, urls_);
  }

  function getUrlForSocialKey(
    uint40 id_,
    string calldata key_
  ) external virtual override onlyLockOwner(id_) view returns (
    string memory
  ){
    return _socials[id_][key_];
  }

  function _deposit(
    uint40 id_,
    uint256 amountOrTokenId_,
    uint40 newUnlockTime_
  ) internal virtual {}

  function deposit(
    uint40 id_,
    uint256 amountOrTokenId_,
    uint40 newUnlockTime_
  ) external virtual override onlyLockOwner(id_) nonReentrant {
    _deposit(id_, amountOrTokenId_, newUnlockTime_);
  }
}
