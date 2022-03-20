// SPDX-License-Identifier: GPL-3.0+

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

import { Authorizable } from "../Control/Authorizable.sol";
import { IERC20 } from "../library/IERC20.sol";
import { ILaunchManagerV1 } from "./ILaunchManagerV1.sol";
import { SafeERC20 } from "../library/SafeERC20.sol";

struct Contribution {
  uint40 count;
  uint256 amount;
}

contract LaunchV1 is Authorizable {
  using SafeERC20 for IERC20;

  constructor(
    address owner_,
    address tokenAddress_,
    uint80 times_,
    uint256 minContribution_,
    uint256 maxContribution_,
    uint256 softCap_,
    uint256 hardCap_
  ) Authorizable(owner_) {
    //
    _creator = ILaunchManagerV1(_msgSender());

    _token = IERC20(tokenAddress_);
    _name = _token.name();
    _symbol = _token.symbol();
    _decimals = _token.decimals();

    _createdAt = uint40(block.timestamp);
    _startsAt = uint40(times_);
    _endsAt = uint40(times_ >> 40);

    _minContribution = minContribution_;
    _maxContribution = maxContribution_;

    _softCap = softCap_;
    _hardCap = hardCap_;
  }

  ILaunchManagerV1 private immutable _creator;

  IERC20 private immutable _token;
  string private _name;
  string private _symbol;
  uint8 private immutable _decimals;

  string private _description;
  string private _icon;

  uint40 private immutable _createdAt;
  uint40 private immutable _startsAt;
  uint40 private immutable _endsAt;

  uint256 private immutable _minContribution;
  uint256 private immutable _maxContribution;

  uint256 private immutable _softCap;
  uint256 private immutable _hardCap;

  mapping(address => Contribution) private _contributions;

  function creator() external view returns (address) {
    return address(_creator);
  }

  function getLaunchBaseData() external view returns (
    address token,
    string memory name,
    string memory symbol,
    uint8 decimals,
    string memory icon,
    uint120 times,
    uint256 balance,
    uint256 softCap,
    uint256 hardCap
  ) {
    token = address(_token);
    name = _name;
    symbol = _symbol;
    decimals = _decimals;
    icon = _icon;
    times = uint120(_createdAt);
    times |= uint120(_startsAt) << 40;
    times |= uint120(_endsAt) << 80;
    balance = address(this).balance;
    softCap = _softCap;
    hardCap = _hardCap;
  }

  function getLaunchAdditionalData() external view returns (
    uint256 minContribution,
    uint256 maxContribution
  ) {
    minContribution = _minContribution;
    maxContribution = _maxContribution;
  }
}
