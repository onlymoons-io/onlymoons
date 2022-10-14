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

import { IAllowedDexes } from "./IAllowedDexes.sol";

struct AllowedDexData {
  address router;
  bool allowed;
  string name;
}

abstract contract AllowedDexes is IAllowedDexes {
  mapping(uint16 => AllowedDexData) internal _allowedDexes;
  mapping(address => uint16) internal _allowedDexesByRouter;
  uint16 internal _allowedDexCount;

  function _updateAllowedDex(
    address router_,
    string calldata name_,
    bool allowed_
  ) internal virtual {
    if (_allowedDexesByRouter[router_] == 0) {
      uint16 id = ++_allowedDexCount;
      _allowedDexes[id] = AllowedDexData({
        name: name_,
        router: router_,
        allowed: allowed_
      });
      _allowedDexesByRouter[router_] = id;
    } else {
      _allowedDexes[_allowedDexesByRouter[router_]].name = name_;
      _allowedDexes[_allowedDexesByRouter[router_]].allowed = allowed_;
    }
  }

  function allowedDexCount() external virtual override view returns (uint16) {
    return _allowedDexCount;
  }

  function getDexDataById(
    uint16 id_
  ) external view returns (
    address router,
    bool allowed,
    string memory name
  ) {
    router = _allowedDexes[id_].router;
    allowed = _allowedDexes[id_].allowed;
    name = _allowedDexes[id_].name;
  }

  function getDexIdByRouter(
    address router_
  ) external view returns (uint16) {
    return _allowedDexesByRouter[router_];
  }
}
