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
import { IERC20 } from "./library/IERC20.sol";
import { TokenLockerV1 } from "./TokenLockerV1.sol";

contract TokenLockerManagerV1 is Ownable {
  event TokenLockerCreated(
    uint40 id,
    address indexed owner,
    address indexed tokenAddress,
    uint256 amount,
    uint40 unlockTime
  );

  constructor() Ownable(msg.sender) {
    _creationEnabled = true;
  }


  bool private _creationEnabled;

  uint40 private _tokenLockerCount;

  /** @dev main mapping for lock data */
  mapping(uint40 => TokenLockerV1) private _tokenLockers;

  /** @dev this mapping makes it possible to search for locks */
  mapping(address => uint40[]) private _tokenLockersForAddress;

  function tokenLockerCount() external view returns (uint40) {
    return _tokenLockerCount;
  }

  function creationEnabled() external view returns (bool) {
    return _creationEnabled;
  }

  /**
   * @dev allow turning off new lockers from being created, so that we can
   * migrate to new versions of the contract & stop people from locking
   * with the older versions. this will not prevent extending, depositing,
   * or withdrawing from old locks - it only stops new locks from being created.
   */
  function setCreationEnabled(bool value_) external onlyOwner() {
    _creationEnabled = value_;
  }

  function createTokenLocker(
    address tokenAddress_,
    uint256 amount_,
    uint40 unlockTime_
  ) external {
    require(_creationEnabled, "Locker creation is disabled");

    uint40 id = _tokenLockerCount++;
    _tokenLockers[id] = new TokenLockerV1(id, msg.sender, tokenAddress_, unlockTime_);

    IERC20 token = IERC20(tokenAddress_);
    token.transferFrom(msg.sender, address(_tokenLockers[id]), amount_);

    // add the creator to the token locker mapping, so it's
    // able to be searched.
    // NOTE that if the ownership is transferred, the new
    // owner will NOT be searchable with this setup.
    _tokenLockersForAddress[msg.sender].push(id);

    // add the locked token to the token lockers mapping
    _tokenLockersForAddress[tokenAddress_].push(id);
    // add the locker contract to this mapping as well, so it's
    // searchable in the same way as tokens within the locker.
    _tokenLockersForAddress[address(_tokenLockers[id])].push(id);

    // if this is an lp token, also add the paired tokens to the mapping
    {
      (bool hasLpData,,address token0Address,address token1Address,,,,) = _tokenLockers[id].getLpData();
      if (hasLpData) {
        _tokenLockersForAddress[token0Address].push(id);
        _tokenLockersForAddress[token1Address].push(id);
      }
    }

    emit TokenLockerCreated(id, msg.sender, tokenAddress_, token.balanceOf(address(_tokenLockers[id])), unlockTime_);
  }

  /**
   * @return the address of a locker contract with the given id
   */
  function getTokenLockAddress(uint40 id_) external view returns (address) {
    return address(_tokenLockers[id_]);
  }

  function getTokenLockData(uint40 id_) external view returns (
    bool isLpToken,
    uint40 id,
    address contractAddress,
    address owner,
    address token,
    address createdBy,
    uint40 createdAt,
    uint40 unlockTime,
    uint256 balance,
    uint256 totalSupply
  ){
    return _tokenLockers[id_].getLockData();
  }

  function getLpData(uint40 id_) external view returns (
    bool hasLpData,
    uint40 id,
    address token0,
    address token1,
    uint256 balance0,
    uint256 balance1,
    uint256 price0,
    uint256 price1
  ) {
    return _tokenLockers[id_].getLpData();
  }

  /** @return an array of locker ids matching the given search address */
  function getTokenLockersForAddress(address address_) external view returns (uint40[] memory) {
    return _tokenLockersForAddress[address_];
  }
}
