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

/**
 *
 */
struct Contribution {
  /**
   * 
   */
  address wallet;

  /**
   * 
   */
  uint256 amount;

  /**
   *
   */
  uint256 tokens;

  /**
   * 
   */
  uint48 timestamp;
}

/**
 *
 */
struct WalletContributions {
  /**
   *
   */
  uint24 numContributions;

  /**
   *
   */
  uint256 amountContributed;

  /**
   *
   */
  uint256 tokens;

  /**
   *
   */
  bool claimed;
}

/**
 *
 */
struct Contributions {
  /**
   *
   */
  uint256 total;

  /**
   *
   */
  uint256 tokens;

  /**
   *
   */
  uint24 numContributors;

  /**
   *
   */
  Contribution[] contributions;

  /**
   *
   */
  mapping(address => WalletContributions) wallets;
}
