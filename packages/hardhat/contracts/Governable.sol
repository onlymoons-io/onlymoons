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

/**
 * @title Governable
 * 
 * parent for governable contracts
 */
abstract contract Governable is Ownable {
  constructor(address owner_, address governor_) Ownable(owner_) {
    _governor_ = governor_;
    emit GovernorshipTransferred(address(0), _governor());
  }

  address internal _governor_;

  event GovernorshipTransferred(address indexed oldGovernor, address indexed newGovernor);

  function _governor() internal view returns (address) {
    return _governor_;
  }

  function governor() external view returns (address) {
    return _governor();
  }

  modifier onlyGovernor() {
    require(_governor() == _msgSender(), "Only the governor can execute this function");
    _;
  }

  function _transferGovernorship(address newGovernor) internal virtual {
    // keep track of old owner for event
    address oldGovernor = _governor();

    // set the new owner
    _governor_ = newGovernor;

    // emit event about ownership change
    emit GovernorshipTransferred(oldGovernor, _governor());
  }

  function transferGovernorship(address newGovernor) external onlyOwner {
    _transferGovernorship(newGovernor);
  }
}
