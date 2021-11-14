// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import { Ownable } from "./Ownable.sol";
import { IUniswapV2Pair } from "./library/Dex.sol";
import { IERC20 } from "./library/IERC20.sol";
import { Util } from "./Util.sol";

contract TokenLockerV1 is Ownable {
  event Extended(uint32 newUnlockTime);
  event Deposited(uint256 amount);
  event Withdrew();

  constructor(uint40 id_, address owner_, address tokenAddress_, uint32 unlockTime_) Ownable(owner_) {
    require(unlockTime_ > uint32(block.timestamp), "Unlock time must be in the future");

    _id = id_;
    _token = IERC20(tokenAddress_);
    _createdBy = owner_;
    _createdAt = uint32(block.timestamp);
    _unlockTime = unlockTime_;
  }
  
  uint40 internal _id;
  IERC20 private _token;
  address private _createdBy;
  uint32 internal _createdAt;
  uint32 internal _unlockTime;

  function _balance() internal view returns (uint256) {
    return _token.balanceOf(address(this));
  }

  function balance() external view returns (uint256) {
    return _balance();
  }

  function _getLockData() internal view returns (
    uint40 id,
    address owner,
    address token,
    address createdBy,
    uint32 createdAt,
    uint32 unlockTime,
    uint256 tokenBalance,
    uint256 totalSupply
  ){
    id = _id;
    owner = getOwner();
    token = address(_token);
    createdBy = _createdBy;
    createdAt = _createdAt;
    unlockTime = _unlockTime;
    tokenBalance = _balance();
    totalSupply = _token.totalSupply();
  }

  function getLockData() external view returns (
    uint40 id,
    address owner,
    address token,
    address createdBy,
    uint32 createdAt,
    uint32 unlockTime,
    uint256 tokenBalance,
    uint256 totalSupply
  ) {
    return _getLockData();
  }

  function getLpData() external view returns (
    uint40 id,
    address token0,
    address token1,
    uint256 balance0,
    uint256 balance1,
    uint256 price0,
    uint256 price1
  ) {
    id = _id;

    (
      token0,
      token1,
      balance0,
      balance1,
      price0,
      price1
    ) = Util.getLpData(address(_token));
  }

  /**
   * @dev deposit and extend duration in one call
   */
  function deposit(uint256 amount_, uint32 newUnlockTime_) external onlyOwner() {
    if (amount_ != 0) {
      uint256 oldBalance = _balance();
      _token.transferFrom(msg.sender, address(this), amount_);
      emit Deposited(_balance() - oldBalance);
    }

    if (newUnlockTime_ != 0) {
      require(newUnlockTime_ >= _unlockTime, "New unlock time must be beyond the previous");
      require(newUnlockTime_ >= uint32(block.timestamp), "New unlock time must be in the future");
      _unlockTime = newUnlockTime_;
      emit Extended(_unlockTime);
    }
  }

  /**
   * @dev withdraw all of the deposited token
   */
  function withdraw() external onlyOwner() {
    require(uint32(block.timestamp) >= _unlockTime, "Wait until unlockTime to withdraw");

    uint256 oldBalance = _balance();
    _token.transfer(msg.sender, oldBalance);

    emit Withdrew();
  }

  /**
   * @dev recovery function -
   * just in case this contract winds up with additional tokens (from dividends, etc)
   */
  function withdrawToken(address address_) external onlyOwner() {
    require(address_ != address(_token), "Use 'withdraw' to withdraw the primary locked token");

    IERC20 theToken = IERC20(address_);

    uint256 oldBalance = theToken.balanceOf(address(this));
    theToken.transfer(msg.sender, oldBalance);
  }

  /**
   * @dev recovery function -
   * just in case this contract winds up with eth in it (from dividends etc)
   */
  function withdrawEth() external onlyOwner() {
    address payable receiver = payable(msg.sender);
    receiver.transfer(address(this).balance);
  }

  receive() external payable {
    // we need this function to receive eth,
    // which might happen from dividend tokens.
  }
}
