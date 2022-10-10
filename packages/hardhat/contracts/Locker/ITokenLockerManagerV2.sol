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

import { ITokenLockerManagerV1 } from "../ITokenLockerManagerV1.sol";
import { IGovernable } from "../Governance/IGovernable.sol";
import { IPausable } from "../Control/IPausable.sol";
import { IIDCounter } from "../IIDCounter.sol";
import { IFeeCollector } from "../Fees/IFeeCollector.sol";

interface ITokenLockerManagerV2 is ITokenLockerManagerV1, IGovernable, IPausable, IIDCounter, IFeeCollector {
  /**
   * @dev this should have been in ITokenLockerManagerV1,
   * but it wound up in TokenLockerManagerV1. define it here instead.
   */
  event TokenLockerCreated(
    uint40 id,
    address indexed token,
    /** @dev LP token pair addresses - these will be address(0) for regular tokens */
    address indexed token0,
    address indexed token1,
    address createdBy,
    /** this is balance for erc20 locks, and tokenId for erc721 locks */
    uint256 balanceOrTokenId,
    uint40 unlockTime
  );
  event TokenLockerCountdownStarted(
    uint40 id,
    uint40 unlockTime
  );
  event TokenLockerDeposit(
    uint40 id,
    uint256 amountOrTokenId,
    uint256 balanceOrTokenId,
    uint40 unlockTime
  );
  event TokenLockerWithdrawal(
    uint40 id
  );

  function countdownDuration() external view returns (uint40);
  function setCountdownDuration(uint40 countdownDuration_) external;

  function createTokenLockerV2(
    address tokenAddress_,
    uint256 amountOrTokenId_,
    uint40 unlockTime_
  ) external payable returns (
    uint40 id,
    address lockAddress
  );

  function setAllowedRouterAddress(
    address routerAddress_,
    bool allowed_
  ) external;
}
