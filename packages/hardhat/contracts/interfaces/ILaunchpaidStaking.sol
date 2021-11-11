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

interface ILaunchpaidStaking {
  event Deposit(address indexed wallet, address indexed tokenAddress, uint256 amount);
  event Withdraw(address indexed wallet, address indexed tokenAddress, uint256 amount);

  function lockFeeMultiplier() external view returns (uint24);
  function setLockFeeMultiplier(uint24 value) external;
  function launchpadToken() external view returns (address);
  function setLaunchpadTokenAddress(address value) external;
  function dexRouter() external view returns (address);
  function setDexRouterAddress(address value) external;
  function getAmountStaked(address tokenAddress) external view returns (uint256);
  function getAmountStaked(address tokenAddress, address wallet) external view returns (uint256 amount, uint256 pool);
  function getNumStakers(address tokenAddress) external view returns (uint40 counter, uint40 actual);
  function getLockDuration(address tokenAddress) external view returns (uint16);
  function getCreatedAt(address tokenAddress) external view returns (uint48);
  function getUpdatedAt(address tokenAddress) external view returns (uint48);
  function getUnlockTime(address tokenAddress) external view returns (uint48);
  function getStakingDataByAddress(address tokenAddress, address wallet) external view returns(
    uint256 allowance,
    string memory symbol,
    uint256 totalSupply,
    uint8 decimals,
    uint256 pool,
    uint256 amount,
    uint40 numStakers,
    uint16 lockDuration,
    uint48 unlockTime
  );
  function getStakingDataById(address tokenAddress, uint40 id) external view returns(
    uint256 allowance,
    string memory symbol,
    uint256 totalSupply,
    uint8 decimals,
    uint256 pool,
    uint256 amount,
    uint40 numStakers,
    uint16 lockDuration,
    uint48 unlockTime
  );
  function getStakingData(address tokenAddress) external view returns(
    uint256 allowance,
    string memory symbol,
    uint256 totalSupply,
    uint8 decimals,
    uint256 pool,
    uint256 amount,
    uint40 numStakers,
    uint16 lockDuration,
    uint48 unlockTime
  );
  /** deposit a specific amount. */
  function deposit(address tokenAddress, uint256 amount, uint16 lockDuration) external;
  /** deposit all */
  function deposit(address tokenAddress, uint16 lockDuration) external;
  /** withdraw a specific amount */
  function withdraw(address tokenAddress, uint256 amount) external;
  /** withdraw all */
  function withdraw(address tokenAddress) external;
  function getLockFee() external view returns(
    address lockTokenAddress,
    string memory lockTokenName,
    string memory lockTokenSymbol,
    uint8 lockTokenDecimals,
    uint256 lockFee
  );
}
