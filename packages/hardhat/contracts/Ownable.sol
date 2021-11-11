// SPDX-License-Identifier: UNLICENSED

/**
  ____/\__    __ __        .__   __  .__                               ____/\__
 /   / /_/   /  Y  \  __ __|  |_/  |_|__|__________    ______ ______  /   / /_/
 \__/ / \   /  \ /  \|  |  \  |\   __\  \____ \__  \  /  ___//  ___/  \__/ / \ 
 / / /   \ /    Y    \  |  /  |_|  | |  |  |_> > __ \_\___ \ \___ \   / / /   \
/_/ /__  / \____|__  /____/|____/__| |__|   __(____  /____  >____  > /_/ /__  /
  \/   \/          \/                   |__|       \/     \/     \/    \/   \/ 

  https://multipass.tools
*/

pragma solidity ^0.8.0;

/**
 * @title Ownable
 * 
 * parent for ownable contracts
 */
abstract contract Ownable {
  constructor() {
    _owner = msg.sender;
  }

  address private _owner;

  event OwnershipTransfered(address indexed oldOwner, address indexed newOwner);

  modifier onlyOwner() {
    require(_owner == msg.sender, "Only the owner can execute this function");
    _;
  }

  function getOwner() public view returns (address) {
    return _owner;
  }

  function transferOwnership(address newOwner) onlyOwner() public {
    // keep track of old owner for event
    address oldOwner = _owner;

    // set the new owner
    _owner = newOwner;

    // emit event about ownership change
    emit OwnershipTransfered(oldOwner, _owner);
  }
}
