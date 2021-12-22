// SPDX-License-Identifier: MIT
// https://solidity-by-example.org/defi/staking-rewards/
// https://github.com/Synthetixio/synthetix/blob/develop/contracts/StakingRewards.sol

pragma solidity ^0.8;

import { Ownable } from "./Ownable.sol";
import { Pausable } from "./Pausable.sol";
import { ReentrancyGuard } from "./library/ReentrancyGuard.sol";
import { IERC20 } from "./library/IERC20.sol";
import { SafeERC20 } from "./library/SafeERC20.sol";

contract StakingRewards is Ownable, Pausable, ReentrancyGuard {
  using SafeERC20 for IERC20;

  IERC20 public stakingToken;

  uint256 private _finishedAt;

  uint256 public rewardRate = 100;
  uint256 public lastUpdateTime;
  uint256 public rewardPerTokenStored;

  uint256 private constant MAXINT = type(uint256).max;

  mapping(address => uint256) public userRewardPerTokenPaid;
  mapping(address => uint256) public rewards;

  uint256 private _totalSupply;
  mapping(address => uint256) private _balances;

  constructor(address _stakingToken) Ownable(_msgSender()) {
    stakingToken = IERC20(_stakingToken);

    _finishedAt = MAXINT;
  }

  function totalSupply() external view returns (uint256) {
    return _totalSupply;
  }

  function balanceOf(address account) external view returns (uint256) {
    return _balances[account];
  }

  function lastTimeRewardApplicable() public view returns (uint256) {
    return block.timestamp < _finishedAt ? block.timestamp : _finishedAt;
  }

  function rewardPerToken() public view returns (uint256) {
    if (_totalSupply == 0) {
      return 0;
    }
    return
      rewardPerTokenStored +
      (((lastTimeRewardApplicable() - lastUpdateTime) * rewardRate * 1e18) / _totalSupply);
  }

  function earned(address account) public view returns (uint256) {
    return
      ((_balances[account] *
        (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18) +
      rewards[account];
  }

  modifier updateReward(address account) {
    rewardPerTokenStored = rewardPerToken();
    lastUpdateTime = lastTimeRewardApplicable();

    rewards[account] = earned(account);
    userRewardPerTokenPaid[account] = rewardPerTokenStored;
    _;
  }

  function stake(uint256 _amount) external nonReentrant onlyNotPaused updateReward(_msgSender()) {
    _getReward();
    _totalSupply += _amount;
    _balances[_msgSender()] += _amount;
    stakingToken.safeTransferFrom(_msgSender(), address(this), _amount);
  }

  function withdraw(uint256 _amount) external nonReentrant updateReward(_msgSender()) {
    _getReward();
    _totalSupply -= _amount;
    _balances[_msgSender()] -= _amount;
    stakingToken.safeTransfer(_msgSender(), _amount);
  }

  function _getReward() private {
    uint256 reward = rewards[_msgSender()];
    rewards[_msgSender()] = 0;
    payable(_msgSender()).transfer(reward);
  }

  function getReward() external nonReentrant updateReward(_msgSender()) {
    _getReward();
  }
}
