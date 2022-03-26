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

import { ILaunchManagerV1 } from "./ILaunchManagerV1.sol";
import { Governable } from "../Governance/Governable.sol";
import { Pausable } from "../Control/Pausable.sol";
import { IDCounter } from "../IDCounter.sol";
import { ILaunchFactory } from "./ILaunchFactory.sol";
import { ILaunchV1 } from "./ILaunchV1.sol";
import { IERC20 } from "../library/IERC20.sol";

contract LaunchManagerV1 is ILaunchManagerV1, Governable, Pausable, IDCounter {
  event LaunchCreated(
    uint40 indexed id,
    address indexed launchAddress,
    address indexed token,
    uint256 amount,
    uint40 startsAt,
    uint40 endsAt
  );

  constructor(address factoryAddress) Governable(_msgSender(), _msgSender()) {
    _factory = ILaunchFactory(factoryAddress);
  }

  ILaunchFactory internal _factory;

  mapping(uint40 => ILaunchV1) internal _launches;

  function factory() external virtual view returns (address) {
    return address(_factory);
  }

  function createLaunch(
    uint8 launchType_,
    address tokenAddress_,
    uint80 times_,
    uint256 minContribution_,
    uint256 maxContribution_,
    uint256 softCap_,
    uint256 hardCap_,
    uint256 amount_
  ) external virtual override onlyNotPaused {
    uint40 id = uint40(_next());

    _launches[id] = ILaunchV1(_factory.createLaunch(
      launchType_,
      _msgSender(),
      tokenAddress_,
      times_,
      minContribution_,
      maxContribution_,
      softCap_,
      hardCap_
    ));

    address launchAddress = address(_launches[id]);

    IERC20 token = IERC20(tokenAddress_);
    require(token.balanceOf(launchAddress) == 0, "Starting balance is not 0");
    // move the tokens to the launch contract
    token.transferFrom(_msgSender(), launchAddress, amount_);
    // make sure the amount transferred was the amount we wanted to transfer.
    // this could differ from amount_ because there could have been a fee/tax
    // on the transaction.
    require(token.balanceOf(launchAddress) == amount_, "Amount transferred differs from input amount");

    emit LaunchCreated(
      id,
      launchAddress,
      tokenAddress_,
      amount_,
      uint40(times_),
      uint40(times_ >> 40)
    );
  }

  function getLaunchBaseData(uint40 id) external virtual override view returns (
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
    return _launches[id].getLaunchBaseData();
  }
}
