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

interface ILaunchpaidLauncher {
  event LaunchCreated(uint40 indexed id, address indexed contractAddress);

  function successfulLaunchCount() external view returns (uint40);
  function dexRouter() external view returns (address);
  function launchpadToken() external view returns (address);
  function stakingContract() external view returns (address);
  // function featuredContract() external view returns (address);
  function setLaunchpadTokenAddress(address value) external;
  function setDexRouterAddress(address value) external;
  function setStakingContractAddress(address value) external;
  // function setFeaturedContractAddress(address value) external;
  function setMinPercentToLiq(uint8 value) external;
  function setMinDuration(uint16 value) external;
  function setMaxDuration(uint16 value) external;
  function setMinFee(uint8 value) external;
  function setMaxFee(uint8 value) external;
  function setOwnerFee(uint8 value) external;
  function getLaunchFees() external view returns (
    uint8 min,
    uint8 max,
    uint8 owner,
    address listingTokenAddress,
    string memory listingTokenName,
    string memory listingTokenSymbol,
    uint8 listingTokenDecimals,
    uint256 listingFee
  );
  function createLaunch(
    address token,
    uint216 ints,
    uint256 tokensToDeposit,
    uint256 tokensForSale,
    // uint256 tokensForPrivateSale,
    // uint256 vestingRate,
    // bool hasPrivateRound,
    bool hasPublicRound,
    uint8[] memory icon
    // address[] memory allowedContributors
  ) external;
  function getLaunchData(uint40 id, bool activeOnly) external view returns (
    bool active,
    address launchContract,
    address token,
    uint256 tokensForSale,
    uint48 beginsAt,
    uint48 endsAt,
    uint32 softCap,
    uint32 hardCap,
    uint8 percentToLiq
  );
  function getTokenData(address token) external view returns (
    string memory name,
    string memory symbol,
    uint8 decimals,
    uint256 totalSupply,
    uint256 balance
  );
  function getFeatured(address wallet) external view returns (uint40);
  function getFeatured() external view returns (uint40);
  function setFeatured(uint40 launch) external;
}
