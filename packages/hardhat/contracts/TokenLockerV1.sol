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
import { IUniswapV2Pair } from "./library/Dex.sol";
import { IERC20 } from "./library/IERC20.sol";
import { Util } from "./Util.sol";

contract TokenLockerV1 is Ownable {
  event Extended(uint40 newUnlockTime);
  event Deposited(uint256 amount);
  event Withdrew();

  constructor(uint40 id_, address owner_, address tokenAddress_, uint40 unlockTime_) Ownable(owner_) {
    require(unlockTime_ > uint40(block.timestamp), "Unlock time must be in the future");

    _id = id_;
    _token = IERC20(tokenAddress_);
    _createdBy = owner_;
    _createdAt = uint40(block.timestamp);
    _unlockTime = unlockTime_;
    _isLpToken = Util.isLpToken(tokenAddress_);
  }

  bool private _isLpToken;
  uint40 private _id;
  IERC20 private _token;
  address private _createdBy;
  uint40 private _createdAt;
  uint40 private _unlockTime;

  function _balance() private view returns (uint256) {
    return _token.balanceOf(address(this));
  }

  function balance() external view returns (uint256) {
    return _balance();
  }

  function getIsLpToken() external view returns (bool) {
    return _isLpToken;
  }

  function getLockData() external view returns (
    bool isLpToken,
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
    isLpToken = _isLpToken;
    id = _id;
    contractAddress = address(this);
    owner = _getOwner();
    token = address(_token);
    createdBy = _createdBy;
    createdAt = _createdAt;
    unlockTime = _unlockTime;
    tokenBalance = _balance();
    totalSupply = _token.totalSupply();
  }

  function getLpData() external view returns (
    bool hasLpData,
    uint40 id,
    address token0,
    address token1,
    uint256 balance0,
    uint256 balance1,
    uint256 price0,
    uint256 price1
  ) {
    // always return the id
    id = _id;

    if (!_isLpToken) {
      // if this isn't an lp token, don't even bother calling getLpData
      hasLpData = false;
    } else {
      // this is an lp token, so let's get some data
      try Util.getLpData(address(_token)) returns (
        address token0_,
        address token1_,
        uint256 balance0_,
        uint256 balance1_,
        uint256 price0_,
        uint256 price1_
      ){
        hasLpData = true;
        token0 = token0_;
        token1 = token1_;
        balance0 = balance0_;
        balance1 = balance1_;
        price0 = price0_;
        price1 = price1_;
      } catch Error(string memory /* reason */) {
        hasLpData = false;
      } catch (bytes memory /* lowLevelData */) {
        hasLpData = false;
      }
    }
  }

  /**
   * @dev deposit and extend duration in one call
   */
  function deposit(uint256 amount_, uint40 newUnlockTime_) external onlyOwner() {
    if (amount_ != 0) {
      uint256 oldBalance = _balance();
      _token.transferFrom(msg.sender, address(this), amount_);
      emit Deposited(_balance() - oldBalance);
    }

    if (newUnlockTime_ != 0) {
      require(newUnlockTime_ >= _unlockTime, "New unlock time must be beyond the previous");
      require(newUnlockTime_ >= uint40(block.timestamp), "New unlock time must be in the future");
      _unlockTime = newUnlockTime_;
      emit Extended(_unlockTime);
    }
  }

  /**
   * @dev withdraw all of the deposited token
   */
  function withdraw() external onlyOwner() {
    require(uint40(block.timestamp) >= _unlockTime, "Wait until unlockTime to withdraw");

    _token.transfer(_getOwner(), _balance());

    emit Withdrew();
  }

  /**
   * @dev recovery function -
   * just in case this contract winds up with additional tokens (from dividends, etc).
   * attempting to withdraw the locked token will revert.
   */
  function withdrawToken(address address_) external onlyOwner() {
    require(address_ != address(_token), "Use 'withdraw' to withdraw the primary locked token");

    IERC20 theToken = IERC20(address_);
    theToken.transfer(_getOwner(), theToken.balanceOf(address(this)));
  }

  /**
   * @dev recovery function -
   * just in case this contract winds up with eth in it (from dividends etc)
   */
  function withdrawEth() external onlyOwner() {
    address payable receiver = payable(_getOwner());
    receiver.transfer(address(this).balance);
  }

  receive() external payable {
    // we need this function to receive eth,
    // which might happen from dividend tokens.
  }
}
