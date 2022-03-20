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

import { IFundraisingBase } from "./IFundraisingBase.sol";
import { Address } from "../library/Address.sol";
import { OwnableV2 } from "../Control/OwnableV2.sol";
import { Pausable } from "../Control/Pausable.sol";
import { IERC20 } from "../library/IERC20.sol";

struct AccountDepositData {
  uint256 amount;
  uint256 numDeposits;
}

abstract contract FundraisingBase is IFundraisingBase, OwnableV2, Pausable {
  using Address for address payable;

  constructor(
    string memory title_,
    string memory description_,
    uint256[] memory data_
  ) OwnableV2(_msgSender()) {
    require(data_[0] > block.timestamp, "Must end in the future");
    
    _title = title_;
    _description = description_;
  }

  string internal _title;
  string internal _description;
  // uint256 internal _totalAmountRaised;
  uint256 internal _numContributors;
  address[] internal _acceptedTokens;

  mapping(address => uint256) internal _claims;
  mapping(address => AccountDepositData) internal _deposits;

  function _fundraisingType() internal virtual view returns (uint8) {
    return 0;
  }

  function getTitle() external view override returns(string memory) {
    return _title;
  }

  function setTitle(string memory value) external virtual override onlyOwner {
    _title = value;
  }

  function getDescription() external view override returns (string memory) {
    return _description;
  }

  function setDescription(string memory value) external virtual override onlyOwner {
    _description = value;
  }

  function setTitleAndDescription(
    string memory title_,
    string memory description_
  ) external virtual override onlyOwner {
    _title = title_;
    _description = description_;
  }

  function getTotalAmountRaised(address tokenAddress) external virtual view override returns (uint256) {
    if (tokenAddress == address(0)) {
      return _claims[address(0)] + address(this).balance;
    } else {
      return _claims[tokenAddress] + IERC20(tokenAddress).balanceOf(address(this));
    }
  }

  function getNumContributors() external virtual view override returns (uint256) {
    return _numContributors;
  }

  function _getAdditionalData() internal virtual view returns (uint256[] memory data) {
    data = new uint256[](0);
  }

  function getData() external virtual view override returns (
    uint8 fundraisingType,
    string memory title,
    string memory description,
    uint256[] memory data,
    uint256 numContributors
  ) {
    fundraisingType = _fundraisingType();
    title = _title;
    description = _description;
    data = _getAdditionalData();
    numContributors = _numContributors;
  }

  function _claimEth() internal virtual {
    uint256 amount = address(this).balance;
    payable(_owner()).sendValue(amount);
    _claims[address(0)] += amount;
  }

  function _claimToken(address tokenAddress) internal virtual {
    IERC20 token = IERC20(tokenAddress);
    uint256 amount = token.balanceOf(address(this));
    token.transfer(_owner(), amount);
    _claims[tokenAddress] += amount;
  }

  function claimEth() external virtual override onlyOwner {
    _claimEth();
  }

  function claimToken(address tokenAddress) external virtual override onlyOwner {
    _claimToken(tokenAddress);
  }

  function claimAll() external virtual override onlyOwner {
    for (uint256 i = 0; i < _acceptedTokens.length; i++) {
      if (_acceptedTokens[i] == address(0)) {
        _claimEth();
      } else {
        _claimToken(_acceptedTokens[i]);
      }
    }
  }

  function _isTokenAccepted(address tokenAddress) internal virtual view returns (bool) {
    for (uint256 i = 0; i < _acceptedTokens.length; i++) {
      if (_acceptedTokens[i] == tokenAddress) {
        return true;
      }
    }

    return false;
  }

  function isTokenAccepted(address tokenAddress) external virtual override view returns (bool) {
    return _isTokenAccepted(tokenAddress);
  }

  receive() external virtual payable onlyNotPaused {
    require(_isTokenAccepted(address(0)), "Eth not accepted");
  }
}
