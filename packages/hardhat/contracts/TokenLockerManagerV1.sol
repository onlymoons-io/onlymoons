// SPDX-License-Identifier: UNLICENSED

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
    uint32 unlockTime
  );

  constructor() Ownable(msg.sender) {
    _creationEnabled = true;
  }

  bool private _creationEnabled;

  uint40 private _tokenLockerCount;

  mapping(uint40 => TokenLockerV1) private _tokenLockers;
  mapping(address => uint40[]) private _accountTokenLockers;

  modifier onlyCreationEnabled() {
    require(_creationEnabled, "Locker creation is disabled");
    _;
  }

  function tokenLockerCount() external view returns (uint40) {
    return _tokenLockerCount;
  }

  function creationEnabled() external view returns (bool) {
    return _creationEnabled;
  }

  function setCreationEnabled(bool value) external onlyOwner() {
    _creationEnabled = value;
  }

  function createTokenLocker(
    address tokenAddress_,
    uint256 amount_,
    uint32 unlockTime_
  ) external onlyCreationEnabled() {
    uint40 id = _tokenLockerCount++;
    _tokenLockers[id] = new TokenLockerV1(id, msg.sender, tokenAddress_, unlockTime_);

    IERC20 token = IERC20(tokenAddress_);
    token.transferFrom(msg.sender, address(_tokenLockers[id]), amount_);

    _accountTokenLockers[msg.sender].push(id);

    emit TokenLockerCreated(id, msg.sender, tokenAddress_, _tokenLockers[id].balance(), unlockTime_);
  }

  function getTokenLockAddress(uint40 id_) external view returns (address) {
    return address(_tokenLockers[id_]);
  }

  function getTokenLockData(uint40 id_) external view returns (
    uint40 id,
    address owner,
    address token,
    address createdBy,
    uint32 createdAt,
    uint32 unlockTime,
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
