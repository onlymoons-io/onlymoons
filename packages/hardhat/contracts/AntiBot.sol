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

import { Ownable } from "./Ownable.sol";

// leave it up to the child to implement the Ownable constructor.
// this way it isn't confusing that the child classes should be
// ownable regardless.
abstract contract AntiBot is Ownable {
  // use uint24 here so we can use max value as an "infinite" value
  uint24 private _numWarningsToBan = 3;

  /** this is used to discover & ban frontrun bots. */
  mapping(address => mapping(bool => uint)) private _txtracker;
  /** these addresses are no longer allowed to make transfers */
  mapping(address => bool) private _banlist;
  /** keeps track of the number of warnings an address has */
  mapping(address => uint8) private _warnings;
  mapping(address => bool) private _checkTxAddresses;
  /**
   * never warn or ban these addresses.
   * we'll want to add liq pools, staking contracts, etc.
   */
  mapping(address => bool) private _neverBan;

  function setNumWarningsToBan(uint24 value) onlyOwner() external {
    _numWarningsToBan = value;
  }

  function addCheckTxAddress(address value) onlyOwner() external {
    _checkTxAddresses[value] = true;
  }

  function removeCheckTxAddress(address value) onlyOwner() external {
    _checkTxAddresses[value] = false;
  }

  /**
   * @return whether or not the address should trigger the anti-bot check.
   * @dev external getter is mostly here for transparency.
   */
  function shouldCheckTxAddress(address value) external view returns (bool) {
    return _checkTxAddresses[value];
  }

  /**
   * look for frontrun bots. if an address makes a buy and a sell in the same block,
   * this will automatically ban them and revert the transaction. unfortunately
   * for the bot, this will mean any tokens they have left will be locked in liquidity ;)
   * in the chance that this bans an innocent, there is an unban function that can
   * be called by the contract owner.
   *
   * @dev this should be called before moving tokens in the `transfer` function.
   */
  function isBotDetected(address from, address to) internal returns (bool) {
    // only run the check if one of the marked addresess is involved.
    // this way, we can mark liquidity pairs and only look for those transactions.
    if (!_checkTxAddresses[from] && !_checkTxAddresses[to])
      return false;

    // look for send & receive in the same block
    if (_txtracker[from][false] == block.number || _txtracker[to][true] == block.number)
      // attempt to warn both `from` and `to` wallets
      if (_warn(from) || _warn(to))
        // if either one was warned, return true
        return true;

    if (!_neverBan[from])
      _txtracker[from][true] = block.number;

    if (!_neverBan[to])
      _txtracker[to][false] = block.number;
    
    return false;
  }

  /**
   * allow manually unbanning addresses, in case of mistakes.
   * however, do NOT allow manual bans. bans should only be done
   * automatically by the contract to control frontrun bots.
   */
  function _ban(address wallet) private {
    if (!_neverBan[wallet])
      _banlist[wallet] = true;
  }
  function unban(address wallet) onlyOwner() external {
    _banlist[wallet] = false;
  }

  function shouldNeverBan(address wallet) external view returns (bool) {
    return _neverBan[wallet];
  }

  function setNeverBan(address wallet, bool value) onlyOwner() external {
    _neverBan[wallet] = value;
  }

  function isBanned(address wallet) public view returns (bool) {
    return _neverBan[wallet] ? false : _banlist[wallet];
  }

  function getNumWarnings(address wallet) external view returns (uint8) {
    return _warnings[wallet];
  }

  function _warn(address wallet) private returns (bool) {
    if (_neverBan[wallet])
      return false;

    // ban the wallet if we hit the limit
    if (++_warnings[wallet] >= _numWarningsToBan)
      _ban(wallet);

    return true;
  }
}
