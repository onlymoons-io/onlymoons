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

interface ITokenLockerManagerV2 is IGovernable, IPausable, IIDCounter, IFeeCollector {
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

  function isInfiniteLock(uint40 id_) external view returns (bool);

  function createTokenLocker(
    address tokenAddress_,
    uint256 amountOrTokenId_,
    uint40 unlockTime_
  ) external payable returns (
    uint40 id,
    address lockAddress
  );
  function getTokenLockAddress(uint40 id_) external view returns (address);
  function getTokenLockData(uint40 id_) external view returns (
    bool isLpToken,
    uint40 id,
    address contractAddress,
    address lockOwner,
    address token,
    address createdBy,
    uint40 createdAt,
    uint40 unlockTime,
    uint256 balance,
    uint256 totalSupply
  );
  function getLpData(uint40 id_) external view returns (
    bool hasLpData,
    uint40 id,
    address token0,
    address token1,
    uint256 balance0,
    uint256 balance1
  );
  function getTokenLockersForAddress(
    address address_
  ) external view returns (
    uint40[] memory
  );
  function notifyLockerOwnerChange(
    uint40 id_,
    address newOwner_,
    address previousOwner_,
    address createdBy_
  ) external;
}
