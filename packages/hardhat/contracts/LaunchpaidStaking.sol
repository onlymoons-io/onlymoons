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

// ERC20 interface
import { IERC20 } from "./library/IERC20.sol";
import { IUniswapV2Router02, IUniswapV2Factory } from "./library/Dex.sol";
import { Math } from "./Math.sol";
import { ILaunchpaidStaking } from "./interfaces/ILaunchpaidStaking.sol";
import { Ownable } from "./Ownable.sol";

struct StakingData {
  address wallet;
  /**
   * combined ints:
   * 
   * uint16 lockDuration - in days. maximum of 65535, which is 179.5 years
   * uint48 createdAt
   * uint48 updatedAt
   */
  uint112 times;
  uint256 amount;
}

struct StakerCount {
  uint40 counter;
  uint40 actual;
}

contract LaunchpaidStaking is ILaunchpaidStaking, Ownable {
  constructor(address launchpadTokenAddress) Ownable() {
    setLaunchpadTokenAddress(launchpadTokenAddress);

    // 5 decimals of precision
    _lockFeeMultiplier = uint24(500000);
    _dexPair = address(0);
    _weth = IERC20(address(0));
  }

  IERC20 private _launchpadToken;
  IUniswapV2Router02 private _dexRouter;
  address private _dexPair;
  IERC20 private _weth;
  uint24 private _lockFeeMultiplier;

  mapping(address => mapping(uint40 => StakingData)) private _stakers;
  mapping(address => mapping(address => uint40)) private _stakerIdMap;
  // mapping(address => mapping(uint40 => address)) private _stakerIdMapReverse;
  mapping(address => StakerCount) private _stakerCount;
  mapping(address => uint256) private _totalStaked;

  function lockFeeMultiplier() external view override returns (uint24) {
    return _lockFeeMultiplier;
  }

  function setLockFeeMultiplier(uint24 value) onlyOwner() external override {
    // make sure the divisor is at least 1, because dividing by 0 will error.
    _lockFeeMultiplier = value == uint24(0) ? uint24(1) : value;
  }

  function launchpadToken() external view override returns (address) {
    return address(_launchpadToken);
  }

  function setLaunchpadTokenAddress(address value) onlyOwner() public override {
    _launchpadToken = IERC20(value);
  }

  function dexRouter() external view override returns (address) {
    return address(_dexRouter);
  }

  function setDexRouterAddress(address value) onlyOwner() public override {
    _dexRouter = IUniswapV2Router02(value);
    _dexPair = IUniswapV2Factory(
      _dexRouter.factory()
    ).createPair(
      address(_launchpadToken),
      _dexRouter.WETH()
    );
    _weth = IERC20(_dexRouter.WETH());
  }

  function getAmountStaked(address tokenAddress) external view override returns (uint256) {
    return _totalStaked[tokenAddress];
  }

  function getAmountStaked(address tokenAddress, address wallet) external view override returns (uint256 amount, uint256 pool) {
    amount = _stakers[tokenAddress][_stakerIdMap[tokenAddress][wallet]].amount;
    pool = _totalStaked[tokenAddress];
  }

  function getNumStakers(address tokenAddress) external view override returns (uint40 counter, uint40 actual) {
    counter = _stakerCount[tokenAddress].counter;
    actual = _stakerCount[tokenAddress].actual;
  }

  function getLockDuration(address tokenAddress) public view override returns (uint16) {
    return uint16(_stakers[tokenAddress][_stakerIdMap[tokenAddress][msg.sender]].times);
  }

  function getCreatedAt(address tokenAddress) public view override returns (uint48) {
    return uint48(_stakers[tokenAddress][_stakerIdMap[tokenAddress][msg.sender]].times >> 16);
  }

  function getUpdatedAt(address tokenAddress) public view override returns (uint48) {
    return uint48(_stakers[tokenAddress][_stakerIdMap[tokenAddress][msg.sender]].times >> 64);
  }

  function getUnlockTime(address tokenAddress) public view override returns (uint48) {
    return getCreatedAt(tokenAddress) + (uint48(getLockDuration(tokenAddress)) * 86400);
  }

  function getStakingDataByAddress(address tokenAddress, address wallet) public view override returns(
    uint256 allowance,
    string memory symbol,
    uint256 totalSupply,
    uint8 decimals,
    uint256 pool,
    uint256 amount,
    uint40 numStakers,
    uint16 lockDuration,
    uint48 unlockTime
  ){
    IERC20 token = IERC20(tokenAddress);

    allowance = token.allowance(wallet, address(this));
    symbol = token.symbol();
    totalSupply = token.totalSupply();
    decimals = token.decimals();
    pool = _totalStaked[tokenAddress];
    amount = _stakers[tokenAddress][_stakerIdMap[tokenAddress][wallet]].amount;
    numStakers = _stakerCount[tokenAddress].actual;
    lockDuration = getLockDuration(tokenAddress);
    unlockTime = getUnlockTime(tokenAddress);
  }

  function getStakingDataById(address tokenAddress, uint40 id) external view override returns(
    uint256 allowance,
    string memory symbol,
    uint256 totalSupply,
    uint8 decimals,
    uint256 pool,
    uint256 amount,
    uint40 numStakers,
    uint16 lockDuration,
    uint48 unlockTime
  ){
    return getStakingDataByAddress(tokenAddress, _stakers[tokenAddress][id].wallet);
  }

  function getStakingData(address tokenAddress) external view override returns(
    uint256 allowance,
    string memory symbol,
    uint256 totalSupply,
    uint8 decimals,
    uint256 pool,
    uint256 amount,
    uint40 numStakers,
    uint16 lockDuration,
    uint48 unlockTime
  ){
    return getStakingDataByAddress(tokenAddress, msg.sender);
  }

  /** deposit a specific amount. */
  function deposit(address tokenAddress, uint256 amount, uint16 lockDuration) public override {
    IERC20 token = IERC20(tokenAddress);

    // used to calculate the actual amount of tokens received
    uint256 oldBalance = token.balanceOf(msg.sender);
    // make the transfer
    token.transferFrom(msg.sender, address(this), amount);
    // the actual amount of tokens that were transfered
    uint256 tokensTransfered = oldBalance - token.balanceOf(msg.sender);

    if (getCreatedAt(tokenAddress) == 0) {
      _stakerCount[tokenAddress].counter++;
      _stakerCount[tokenAddress].actual++;
      _stakerIdMap[tokenAddress][msg.sender] = _stakerCount[tokenAddress].counter;
    }

    _stakers[tokenAddress][_stakerIdMap[tokenAddress][msg.sender]].wallet = msg.sender;

    _stakers[tokenAddress][_stakerIdMap[tokenAddress][msg.sender]].amount += tokensTransfered;

    uint16 _lockDuration = getCreatedAt(tokenAddress) == 0
      ? lockDuration
      : Math.clamp16(lockDuration, getLockDuration(tokenAddress), type(uint16).max);
    
    uint48 _createdAt = getCreatedAt(tokenAddress) == 0
      ? uint48(block.timestamp)
      : getCreatedAt(tokenAddress);
    
    uint48 _updatedAt = uint48(block.timestamp);

    _stakers[tokenAddress][_stakerIdMap[tokenAddress][msg.sender]].times = uint112(_lockDuration)
      | uint112(_createdAt) << 16
      | uint112(_updatedAt) << 64;

    _totalStaked[tokenAddress] += tokensTransfered;

    emit Deposit(msg.sender, tokenAddress, tokensTransfered);
  }

  /** deposit all */
  function deposit(address tokenAddress, uint16 lockDuration) external override {
    IERC20 token = IERC20(tokenAddress);

    deposit(tokenAddress, token.balanceOf(msg.sender), lockDuration);
  }

  /** withdraw a specific amount */
  function withdraw(address tokenAddress, uint256 amount) public override {
    require(
      _stakers[tokenAddress][_stakerIdMap[tokenAddress][msg.sender]].amount >= amount,
      "Requested amount exceeds staked amount"
    );
    require(uint48(block.timestamp) >= getUnlockTime(tokenAddress), "Tokens are locked");

    IERC20 token = IERC20(tokenAddress);
    // token.transfer(msg.sender, amount);
    token.transferFrom(address(this), msg.sender, amount);

    _stakers[tokenAddress][_stakerIdMap[tokenAddress][msg.sender]].amount -= amount;
    _stakers[tokenAddress][_stakerIdMap[tokenAddress][msg.sender]].times = uint112(0)
      | uint112(block.timestamp) << 64;

    _totalStaked[tokenAddress] -= amount;

    if (_stakers[tokenAddress][_stakerIdMap[tokenAddress][msg.sender]].amount == 0) {
      // it should be safe to set to max value as "undefined"
      // if we ever hit the max value here, we have bigger problems.
      _stakerIdMap[tokenAddress][msg.sender] = type(uint40).max;
      // since we have no staked tokens remaining,
      // decrease the stakerCount for this token by 1.
      _stakerCount[tokenAddress].actual--;
    }

    emit Withdraw(msg.sender, tokenAddress, amount);
  }

  /** withdraw all */
  function withdraw(address tokenAddress) external override {
    withdraw(tokenAddress, _stakers[tokenAddress][_stakerIdMap[tokenAddress][msg.sender]].amount);
  }

  function getLockFee() external view override returns (
    address lockTokenAddress,
    string memory lockTokenName,
    string memory lockTokenSymbol,
    uint8 lockTokenDecimals,
    uint256 lockFee
  ){
    lockTokenAddress = address(_launchpadToken);
    lockTokenName = _launchpadToken.name();
    lockTokenSymbol = _launchpadToken.symbol();
    lockTokenDecimals = _launchpadToken.decimals();

    if (_dexPair == address(0) || address(_weth) == address(0)) {
      lockFee = 0;
    } else {
      lockFee = (
        (
          (
            (
              _launchpadToken.balanceOf(_dexPair) / (10**lockTokenDecimals)
            ) / (
              _weth.balanceOf(_dexPair) / (10**_weth.decimals())
            )
          ) * _lockFeeMultiplier
        ) / 10000000
      ) * 10**lockTokenDecimals;
    }
  }
}
