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

import { IStakingV1 } from "./IStakingV1.sol";
import { IStakingTokenV1 } from "./IStakingTokenV1.sol";
import { StakingV1 } from "./StakingV1.sol";
import { Address } from "../library/Address.sol";
import { IERC20 } from "../library/IERC20.sol";
import { SafeERC20 } from "../library/SafeERC20.sol";

/**
 * token reflection
 */
contract StakingTokenV1 is IStakingTokenV1, StakingV1 {
  using Address for address payable;
  using SafeERC20 for IERC20;

  constructor(
    address owner_,
    address tokenAddress_,
    address rewardsTokenAddress_,
    uint16 lockDurationDays_
  ) StakingV1(
    owner_,
    tokenAddress_,
    lockDurationDays_
  ) {
    //
    _rewardsToken = IERC20(rewardsTokenAddress_);
  }

  IERC20 internal immutable _rewardsToken;

  function _stakingType() internal virtual override view returns (uint8) {
    return 1;
  }

  function rewardsToken() external virtual view returns (address) {
    return address(_rewardsToken);
  }

  function rewardsAreToken() public virtual override(IStakingV1, StakingV1) pure returns (bool) {
    return true;
  }

  function _sendRewards(address account, uint256 amount) internal virtual override returns (bool) {
    _rewardsToken.safeTransfer(account, amount);
    return true;
  }

  function _getRewardsBalance() internal virtual override view returns (uint256) {
    return _rewardsToken.balanceOf(address(this));
  }

  /**
   * @dev since we're dealing with tokens instead of eth,
   * use this to recover any eth mistakenly sent to this contract.
   * this probably would never happen since receive() is reverting.
   *
   * this must be called by the owner, and sends eth to owner
   */
  function recoverEth() external virtual onlyOwner {
    payable(_owner()).sendValue(address(this).balance);
  }

  /** @dev override this since we're no longer tracking eth deposits */
  receive() external virtual override payable {
    revert();
  }
}
