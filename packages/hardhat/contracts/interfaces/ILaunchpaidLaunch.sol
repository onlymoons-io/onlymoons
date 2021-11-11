// SPDX-License-Identifier: UNLICENSED

/**
  ____/\__    __ __        .__   __  .__                               ____/\__
 /   / /_/   /  Y  \  __ __|  |_/  |_|__|__________    ______ ______  /   / /_/
 \__/ / \   /  \ /  \|  |  \  |\   __\  \____ \__  \  /  ___//  ___/  \__/ / \ 
 / / /   \ /    Y    \  |  /  |_|  | |  |  |_> > __ \_\___ \ \___ \   / / /   \
/_/ /__  / \____|__  /____/|____/__| |__|   __(____  /____  >____  > /_/ /__  /
  \/   \/          \/                   |__|       \/     \/     \/    \/   \/ 

  https://multipass.tools
*/

pragma solidity ^0.8.0;

interface ILaunchpaidLaunch {
  // function id() external view returns (uint40);
  function owner() external view returns (address);
  function token() external view returns (address);
  function setToken(address value) external;
  function active() external view returns (bool);
  function listed() external view returns (bool);
  function ended() external view returns (bool);
  function refundable() external view returns (bool);
  function finalized() external view returns (bool);
  function percentToLiq() external view returns (uint8);
  function setPercentToLiq(uint8 value) external;
  function tokensToDeposit() external view returns (uint256);
  function setTokensToDeposit(uint256 value) external;
  function tokensDeposited() external view returns (uint256);
  function tokensForSale() external view returns (uint256);
  function setTokensForSale(uint256 value) external;
  function tokensForPrivateSale() external view returns (uint256);
  function setTokensForPrivateSale(uint256 value) external;
  function vestingRate() external view returns (uint256);
  function setVestingRate(uint256 value) external;
  function privateRoundIsVested() external view returns (bool);
  function setPrivateRoundIsVested(bool value) external;
  function hasPublicRound() external view returns (bool);
  function setHasPublicRound(bool value) external;
  function hasPrivateRound() external view returns (bool);
  function setHasPrivateRound(bool value) external;
  function tokensSold() external view returns (uint256);
  function minContribution() external view returns (uint256);
  function setMinContribution(uint256 value) external;
  function maxContribution() external view returns (uint256);
  function setMaxContribution(uint256 value) external;
  function beginsAt() external view returns (uint48);
  function setBeginsAt(uint48 value) external;
  function duration() external view returns (uint16);
  function setDuration(uint16 value) external;
  function endsAt() external view returns (uint48);
  function liqLockDuration() external view returns (uint48);
  function setLiqLockDuration(uint48 value) external;
  function setTimes(
    uint48 __beginsAt,
    uint16 __duration,
    uint48 __liqLockDuration
  ) external;
  function softCap() external view returns (uint32);
  function setSoftCap(uint32 value) external;
  function hardCap() external view returns (uint32);
  function setHardCap(uint32 value) external;
  function privateHardCap() external view returns (uint32);
  function setPrivateHardCap(uint32 value) external;
  function setCaps(
    uint32 __softCap,
    uint32 __hardCap,
    uint32 __privateHardCap
  ) external;
  function icon() external view returns (uint8[] memory);
  function setIcon(uint8[] memory value) external;
  function allowContributors(address[] memory wallets) external;
  function revokeContributors(address[] memory wallets) external;
  function isAllowedToContribute(address wallet) external view returns (bool);
  function getTotalContributions() external view returns (
    uint256 amount,
    uint256 tokens,
    uint24 numContributors,
    uint24 numContributions
  );
  function getContributionsForAddress(
    address _address
  ) external view returns (
    uint256 amount,
    uint256 tokens,
    uint24 numContributions
  );
  function list() external;
  function finalize() external;
  function claim() external;
  function refund() external;
  function tokensPerETH() external view returns (uint256 privateRate, uint256 publicRate);
}
