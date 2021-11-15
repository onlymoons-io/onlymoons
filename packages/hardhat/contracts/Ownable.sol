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

/**
 * @title Ownable
 * 
 * parent for ownable contracts
 */
abstract contract Ownable {
  constructor(address owner_) {
    _owner = owner_;
    emit OwnershipTransferred(address(0), _owner);
  }

  address private _owner;

  event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);

  modifier onlyOwner() {
    require(_owner == msg.sender, "Only the owner can execute this function");
    _;
  }

  function _getOwner() internal view returns (address) {
    return _owner;
  }

  function getOwner() external view returns (address) {
    return _owner;
  }

  function _transferOwnership(address newOwner_) private onlyOwner() {
    // keep track of old owner for event
    address oldOwner = _owner;

    // set the new owner
    _owner = newOwner_;

    // emit event about ownership change
    emit OwnershipTransferred(oldOwner, _owner);
  }

  function transferOwnership(address newOwner_) external onlyOwner() {
    _transferOwnership(newOwner_);
  }
}
