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

  mapping(uint40 => TokenLockerV1) private _tokenLockers;
  mapping(address => uint40[]) private _accountTokenLockers;

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

    _accountTokenLockers[msg.sender].push(id);

    emit TokenLockerCreated(id, msg.sender, tokenAddress_, _tokenLockers[id].balance(), unlockTime_);
  }

  /**
   * @return the address of a locker contract with the given id
   */
  function getTokenLockAddress(uint40 id_) external view returns (address) {
    return address(_tokenLockers[id_]);
  }

  function getTokenLockData(uint40 id_) external view returns (
    uint40 id,
    address contractAddress,
    address owner,
    address token,
    address createdBy,
    uint40 createdAt,
    uint40 unlockTime,
    uint256 tokenBalance,
    uint256 totalSupply
  ){
    return _tokenLockers[id_].getLockData();
  }

  function getLpData(uint40 id_) external view returns (
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

  function getTokenLockersForAccount(address account_) external view returns (uint40[] memory) {
    return _accountTokenLockers[account_];
  }
}
