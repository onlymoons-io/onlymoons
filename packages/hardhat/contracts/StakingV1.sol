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

import { Ownable } from "./Ownable.sol";
import { Pausable } from "./Pausable.sol";
import { IERC20 } from "./library/IERC20.sol";
import { ReentrancyGuard } from "./library/ReentrancyGuard.sol";
import { SafeERC20 } from "./library/SafeERC20.sol";
import { Util } from "./Util.sol";
import { Math } from "./Math.sol";

struct StakerData {
  uint160 lastClaimData;
  uint256 amount;
  uint256 totalClaimed;
}

struct DepositData {
  uint256 amount;
  uint256 totalStaked;
  uint80 timeData;
}

contract StakingV1 is Ownable, Pausable, ReentrancyGuard {
  using SafeERC20 for IERC20;

  constructor(
    address owner_,
    address tokenAddress_,
    string memory name_,
    uint16 lockDurationDays_
  ) Ownable(owner_) {
    //
    _token = IERC20(tokenAddress_);
    _name = name_;
    _decimals = _token.decimals();
    _lockDurationDays = lockDurationDays_;
  }

  IERC20 private immutable _token;

  string private _name;
  uint8 private immutable _decimals;

  // the lock duration for this staking contract should always remain the same
  uint16 private immutable _lockDurationDays;

  uint256 private _totalStaked;
  uint256 private _totalRewards;
  uint256 private _totalClaimed;

  uint256[] private _blocksWithDeposit;
  mapping(uint256 => uint256) private _blocksWithDepositIndexMap;

  mapping(address => StakerData) private _stakers;

  mapping(uint256 => DepositData[]) private _deposits;

  function token() external view returns (address) {
    return address(_token);
  }

  function getStakingData() external view returns (
    address stakedToken,
    string memory name,
    uint8 decimals,
    uint256 totalStaked,
    uint256 totalRewards,
    uint256 totalClaimed
  ) {
    stakedToken = address(_token);
    name = _name;
    decimals = _decimals;
    totalStaked = _totalStaked;
    totalRewards = _totalRewards;
    totalClaimed = _totalClaimed;
  }

  function getStakingDataForAccount(address account) external view returns (
    uint256 amount,
    uint40 lastClaimedBlock,
    uint40 lastClaimedAt,
    uint40 lastClaimedDepositBlock,
    uint40 lastClaimedDepositNum,
    uint256 pending,
    uint256 totalClaimed
  ) {
    amount = _stakers[account].amount;
    lastClaimedBlock = _lastClaimedBlock(account);
    lastClaimedAt = _lastClaimedAt(account);
    lastClaimedDepositBlock = _lastClaimedDepositBlock(account);
    lastClaimedDepositNum = _lastClaimedDepositNum(account);
    pending = _pending(account);
    totalClaimed = _stakers[account].totalClaimed;
  }

  function _pending(address account) private view returns (uint256) {
    if (_stakers[account].amount == 0) return 0;
    if (_blocksWithDeposit.length == 0) return 0;

    uint40 lastClaimedDepositBlock = _lastClaimedDepositBlock(account);
    uint40 lastClaimedDepositNum = _lastClaimedDepositNum(account);

    uint256 pendingAmount = 0;

    for (uint256 b = _blocksWithDepositIndexMap[lastClaimedDepositBlock]; b < _blocksWithDeposit.length; b++) {
      for (uint256 d = 0; d < _deposits[_blocksWithDeposit[b]].length; d++) {
        // there could be more than 1 deposit in a single block, with a withdrawal
        // happening in between them, so we need to check deposit number/id.
        // skip this check if we're processing a block newer than the last claim
        if (
          uint40(_deposits[_blocksWithDeposit[b]][d].timeData) > lastClaimedDepositBlock
          && uint40(_deposits[_blocksWithDeposit[b]][d].timeData >> 40) <= lastClaimedDepositNum
        ){
          continue;
        }

        // calculate the amount of rewards for this deposit
        // based on the accounts weight in the staking pool at the time
        pendingAmount += Math.mulScale(
          _deposits[_blocksWithDeposit[b]][d].amount,
          Math.percent(
            _stakers[account].amount,
            _deposits[_blocksWithDeposit[b]][d].totalStaked,
            18
          ),
          10 ** 18
        );
      }
    }

    return pendingAmount;
  }

  function _claim() private returns (bool) {
    uint256 pendingRewards = _pending(_msgSender());

    _stakers[_msgSender()].lastClaimData = uint160(block.number);
    _stakers[_msgSender()].lastClaimData |= uint160(block.timestamp) << 40;
    _stakers[_msgSender()].lastClaimData |= uint160(
      _blocksWithDeposit.length == 0
        ? 0
        : _blocksWithDeposit[_blocksWithDeposit.length - 1]
    ) << 80;
    _stakers[_msgSender()].lastClaimData |= uint160(
      _blocksWithDeposit.length == 0
        ? 0
        : uint40(
          _deposits[
            _blocksWithDeposit[_blocksWithDeposit.length - 1]
          ][
            _deposits[
              _blocksWithDeposit[_blocksWithDeposit.length - 1]
            ].length - 1
          ].timeData >> 40
        )
    ) << 120;

    // if we have no pending rewards, skip
    if (pendingRewards == 0) return false;
    
    _stakers[_msgSender()].totalClaimed += pendingRewards;
    _totalClaimed += pendingRewards;

    payable(_msgSender()).transfer(pendingRewards);

    return true;
  }

  function claim() external nonReentrant {
    require(_claim(), "Claim failed");
  }

  /**
   * @dev deposit amount of tokens to the staking pool.
   * reverts if tokens are lost during transfer.
   */
  function deposit(uint256 amount) external nonReentrant onlyNotPaused {
    require(amount != 0, "Deposit amount cannot be 0");

    // claim before depositing
    _claim();

    _stakers[_msgSender()].amount += amount;
    _totalStaked += amount;

    // store previous balance to determine actual amount transferred
    uint256 oldBalance = _token.balanceOf(address(this));
    // make the transfer
    _token.safeTransferFrom(_msgSender(), address(this), amount);
    require(
      amount == _token.balanceOf(address(this)) - oldBalance,
      "Lost tokens during transfer"
    );
  }

  /**
   * @dev currently only supports full withdrawals.
   */
  function withdraw() external nonReentrant {
    require(_stakers[_msgSender()].amount != 0, "Staked amount is 0");

    if (_lockDurationDays != 0) {
      require(
        uint40(block.timestamp) > _lastClaimedAt(_msgSender()) + (uint40(_lockDurationDays) * 86400),
        "Wait for tokens to unlock before withdrawing"
      );
    }

    _claim();

    uint256 amountToWithdraw = _stakers[_msgSender()].amount;
    _stakers[_msgSender()].amount = 0;
    _totalStaked -= amountToWithdraw;
    _token.safeTransfer(_msgSender(), amountToWithdraw);
  }

  function _lastClaimedBlock(address account) private view returns (uint40) {
    return uint40(_stakers[account].lastClaimData);
  }

  function _lastClaimedAt(address account) private view returns (uint40) {
    return uint40(_stakers[account].lastClaimData >> 40);
  }

  function _lastClaimedDepositBlock(address account) private view returns (uint40) {
    return uint40(_stakers[account].lastClaimData >> 80);
  }

  function _lastClaimedDepositNum(address account) private view returns (uint40) {
    return uint40(_stakers[account].lastClaimData >> 120);
  }

  receive() external payable onlyNotPaused {
    require(msg.value != 0, "Receive value cannot be 0");

    _totalRewards += msg.value;

    if (_deposits[block.number].length == 0) {
      _blocksWithDeposit.push(block.number);
      _blocksWithDepositIndexMap[block.number] = _blocksWithDeposit.length - 1;
    }

    _deposits[block.number].push(
      DepositData({
        amount: msg.value,
        totalStaked: _totalStaked,
        timeData: uint80(block.number) | (uint80(_deposits[block.number].length + 1) << 40)
      })
    );
  }
}
