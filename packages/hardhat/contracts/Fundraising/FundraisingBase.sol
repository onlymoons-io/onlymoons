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
  uint256 internal _totalAmountRaised;
  uint256 internal _numContributors;

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

  function getTotalAmountRaised() external virtual view override returns (uint256) {
    return _totalAmountRaised;
  }

  function getNumContributors() external virtual view override returns (uint256) {
    return _numContributors;
  }

  function _getAdditionalData() internal virtual view returns (uint256[] memory data) {
    data = new uint256[](0);
    // data[0] = _endsAt;
    // data[1] = _successThreshold;
  }

  function getData() external virtual view override returns (
    uint8 fundraisingType,
    string memory title,
    string memory description,
    uint256[] memory data,
    uint256 totalAmountRaised,
    uint256 numContributors
  ) {
    fundraisingType = _fundraisingType();
    title = _title;
    description = _description;
    data = _getAdditionalData();
    totalAmountRaised = _totalAmountRaised;
    numContributors = _numContributors;
  }

  function _claim() internal virtual {
    payable(_owner()).sendValue(address(this).balance);
  }

  function claim() external virtual override onlyOwner {
    _claim();
  }

  function _deposit(address sender, uint256 amount) internal virtual {
    if (_deposits[sender].numDeposits == 0) {
      _numContributors++;
    }

    _deposits[sender].numDeposits++;
    _deposits[sender].amount += amount;
    _totalAmountRaised += amount;
  }

  // function deposit() external virtual payable override onlyNotPaused {
  //   _deposit(_msgSender(), msg.value);
  // }

  receive() external virtual payable onlyNotPaused {
    _deposit(_msgSender(), msg.value);
  }
}
