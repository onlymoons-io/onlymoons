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

import { Contribution } from "./Contributions.sol";

struct Launch {
  /**
   * creator of this launch
   */
  address owner;

  /**
   * reference to token
   */
  address token;

  /**
   * is the launch ended?
   */
  bool ended;

  /**
   * is the launch finalized? this is essentially success or
   * failure for the launch. if ended is true, and finalized
   * is false, then the launch failed. if ended and finalized
   * are both true, then the launch was successful.
   */
  bool finalized;

  /**
   * key used to verify contributions. this key isn't
   * generated until the launch is started.
   */
  bytes32 key;

  // TODO: we can optimize these ints better

  /**
   * numeric id for this launch. this starts at 1, not 0,
   * so that we can use a value of 0 to tell if the launch
   * exists or not.
   */
  uint40 id;

  /**
   * 0-100 integer percent value.
   * default to 100.
   * if percent is 100, charge no fee (except normal gas fee).
   * if percent is below 100, calculate fee.
   */
  uint8 percentToLiq;

  /**
   * soft & hard cap, combined into a 64 bit int.
   * uint32 = soft cap
   * uint32 bits = hard cap
   */
  uint64 cap;

  /**
   * time ints, combined into a 112 bit int.
   * uint48 = beginsAt
   * uint16 = duration
   * uint48 = liq lock duration
   */
  uint112 times;

  /**
   * number of tokens that are deposited
   */
  uint256 tokensForPresale;

  /**
   *
   */
  uint256 minContribution;

  /**
   *
   */
  uint256 maxContribution;

  /**
   *
   */
  uint256 amountReceivedFromSale;

  /**
   * png encoded icon
   */
  string icon;

  /**
   * 
   */
  Contribution[] contributions;
}
