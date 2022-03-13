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

import { IFundraising } from "./IFundraising.sol";
import { Address } from "../library/Address.sol";
import { Ownable } from "../Ownable.sol";
import { Pausable } from "../Pausable.sol";

struct AccountDepositData {
  uint256 amount;
  uint256 numDeposits;
}

contract Fundraising is IFundraising, Ownable, Pausable {
  using Address for address payable;

  constructor(
    string memory title_,
    string memory description_,
    uint40 endsAt_,
    uint256 successThreshold_
  ) Ownable(_msgSender()) {
    require(endsAt_ > block.timestamp, "Must end in the future");
    
    _title = title_;
    _description = description_;
    _endsAt = endsAt_;
    _successThreshold = successThreshold_;
  }

  string internal _title;
  string internal _description;
  uint40 internal immutable _endsAt;
  uint256 internal _successThreshold;
  uint256 internal _totalAmountRaised;
  uint40 internal _numContributors;

  mapping(address => AccountDepositData) internal _deposits;

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

  function getEndsAt() external view override returns (uint40) {
    return _endsAt;
  }

  function getTotalAmountRaised() external virtual view override returns (uint256) {
    return _totalAmountRaised;
  }

  function getNumContributors() external virtual view override returns (uint40) {
    return _numContributors;
  }

  function getData() external virtual view override returns (
    string memory title,
    string memory description,
    uint40 endsAt,
    uint256 totalAmountRaised,
    uint40 numContributors
  ) {
    title = _title;
    description = _description;
    endsAt = _endsAt;
    totalAmountRaised = _totalAmountRaised;
    numContributors = _numContributors;
  }

  function claim() external virtual override onlyOwner {
    require(_totalAmountRaised >= _successThreshold, "Not enough raised to claim");

    payable(_owner()).sendValue(address(this).balance);
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
