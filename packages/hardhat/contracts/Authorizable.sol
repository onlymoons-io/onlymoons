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

import { Ownable } from "./Ownable.sol";

abstract contract Authorizable is Ownable {
  event Authorized(address indexed account, bool value);

  constructor(address owner_) Ownable(owner_) {
    //
  }

  mapping(address => bool) internal _authorized;

  modifier onlyAuthorized() {
    require(_isAuthorized(_msgSender()), "Unauthorized");
    _;
  }

  function _isAuthorized(address account) internal virtual view returns (bool) {
    // always return true for the owner
    return account == _owner() ? true : _authorized[account];
  }

  function isAuthorized() external view returns (bool) {
    return _isAuthorized(_msgSender());
  }

  function _authorize(address account, bool value) internal virtual {
    _authorized[account] = value;

    emit Authorized(account, value);
  }

  /** @dev only allow the owner to authorize more accounts */
  function authorize(address account, bool value) external onlyOwner {
    _authorize(account, value);
  }
}
