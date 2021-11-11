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
// dex specific stuff - uniswap, pancakeswap, etc
import { IUniswapV2Router02, IUniswapV2Factory } from "./library/Dex.sol";

import { ILaunchpaidLauncher } from "./interfaces/ILaunchpaidLauncher.sol";
import { ILaunchpaidStaking } from "./interfaces/ILaunchpaidStaking.sol";
// import { ILaunchpaidFeatured } from "./ILaunchpaidFeatured.sol";
import { LaunchpaidLaunch } from "./LaunchpaidLaunch.sol";
import { Governable } from "./Governable.sol";

// ownable contract parent class
import { Ownable } from "./Ownable.sol";

// launch struct
import { Launch } from "./Launch.sol";
import { Contribution } from "./Contributions.sol";

// custom math functions
import { Math } from "./Math.sol";

import { Util } from "./Util.sol";

contract LaunchpaidLauncher is ILaunchpaidLauncher, Ownable, Governable {
  constructor(address launchpadTokenAddress, address stakingContractAddress) Ownable() Governable(launchpadTokenAddress) {
    // setDexRouterAddress(address(0)); // 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
    setLaunchpadTokenAddress(launchpadTokenAddress);
    setStakingContractAddress(stakingContractAddress);
    // setFeaturedContractAddress(featuredContractAddress);
  }

  IUniswapV2Router02 private _dexRouter;
  // address private _dexPair;

  address private _defaultLiqPairToken;
  IERC20 private _launchpadToken;

  ILaunchpaidStaking private _stakingContract;
  // ILaunchpaidFeatured private _featuredContract;

  mapping(uint40 => LaunchpaidLaunch) private launches;

  /**
   * wallet > launch_id
   * maps a wallet address to their preferred featured launch
   */
  mapping(address => uint40) private _featured;

  /**
   * start this at 1 instead of 0, so we can skip the index 0,
   * and use it as a `doesExist` sort of check
   */
  uint40 public launchCount = 1;

  uint40 private _successfulLaunchCount = 0;

  /** minimum duration for launches, in minutes. default to 1 hour. */
  uint16 public minDuration = 60;

  /** maximum duration for launches, in minutes. default to 1 week. */
  uint16 public maxDuration = 10080;

  /** minimum percent of proceeds from the launch that go to liquidity. */
  uint8 public minPercentToLiq = 65;

  /**
   * fee that gets split between dividends and the contract owner.
   * if the launch has 100% to liquidity, the fee is minFee.
   * if the launch has [minPercentToLiq]% to liquidity, the fee is maxFee.
   * values in between are interpolated.
   * this value has 1 decimal. so a value of 1 is actually 0.1%
   */
  uint8 public minFee = 2;

  /**
   * maximum fee that gets split between this contract and its owner.
   * if the launch has 100% to liquidity, the fee is minFee.
   * this value has 1 decimal. so a value of 60 is actually 6%
   */
  uint8 public maxFee = 60;

  /** percent of the total fee that goes to the owner */
  uint8 public ownerFee = 5;

  function successfulLaunchCount() external view returns (uint40) {
    return _successfulLaunchCount;
  }

  function dexRouter() public view override returns (address) {
    return address(_dexRouter);
  }

  function launchpadToken() public view override returns (address) {
    return address(_launchpadToken);
  }

  function stakingContract() public view override returns (address) {
    return address(_stakingContract);
  }

  // function featuredContract() public view override returns (address) {
  //   return address(_featuredContract);
  // }

  function setLaunchpadTokenAddress(address value) onlyOwner() public override {
    _launchpadToken = IERC20(value);
  }

  function setDexRouterAddress(address value) onlyOwner() public override {
    _dexRouter = IUniswapV2Router02(value);
    _defaultLiqPairToken = _dexRouter.WETH();
    // _dexPair = IUniswapV2Factory(
    //   _dexRouter.factory()
    // ).createPair(
    //   address(this),
    //   _dexRouter.WETH()
    // );
  }

  function setStakingContractAddress(address value) onlyOwner() public override {
    _stakingContract = ILaunchpaidStaking(value);
  }

  // function setFeaturedContractAddress(address value) onlyOwner() public override {
  //   _featuredContract = ILaunchpaidFeatured(value);
  // }

  function setMinPercentToLiq(uint8 value) onlyOwner() public override {
    // never, ever allow liq percent below 60%, because that's just silly.
    // todo - maybe tweak the lower limit of 50
    minPercentToLiq = Math.clamp8(value, 60, 100);
  }

  function setMinDuration(uint16 value) onlyOwner() public override {
    minDuration = value;
  }

  function setMaxDuration(uint16 value) onlyOwner() public override {
    maxDuration = value;
  }

  function setMinFee(uint8 value) onlyOwner() public override {
    // never allow minFee to be above 2%, but allow some adjusting if needed
    minFee = Math.clamp8(value, 0, 20);

    // if maxFee would now be below minFee, we need to clamp it
    if (maxFee < minFee) {
      maxFee = minFee;
    }
  }

  function setMaxFee(uint8 value) onlyOwner() public override {
    // never allow maxFee to be above 20%, but allow some adjusting if needed
    maxFee = Math.clamp8(value, minFee, 200);

    // if minFee would now be above maxFee, we need to clamp it
    if (minFee > maxFee) {
      minFee = maxFee;
    }
  }

  function setOwnerFee(uint8 value) onlyOwner() public override {
    // never allow ownerFee to be above 20%, but allow some adjusting if needed
    ownerFee = Math.clamp8(value, 0, 20);
  }

  function getLaunchFees() external view override returns (
    uint8 min,
    uint8 max,
    uint8 owner,
    address listingTokenAddress,
    string memory listingTokenName,
    string memory listingTokenSymbol,
    uint8 listingTokenDecimals,
    uint256 listingFee
  ){
    min = minFee;
    max = maxFee;
    owner = ownerFee;
    // listingTokenAddress = address(_launchpadToken);
    // listingTokenName = _launchpadToken.name();
    // listingTokenSymbol = _launchpadToken.symbol();
    // listingTokenDecimals = _launchpadToken.decimals();
    (
      listingTokenAddress,
      listingTokenName,
      listingTokenSymbol,
      listingTokenDecimals,
      listingFee
    ) = _stakingContract.getLockFee();
  }

  /**
   * @param ints  combines a bunch of ints into one, so we can pass more data
   *              uint48 (0) beginsAt
   *              uint16 (48) duration
   *              uint48 (64) liqLockDuration
   *              uint8 (112) percentToLiq
   *              uint32 (120) softCap
   *              uint32 (152) hardCap
   *              uint32 (184) privateHardCap
   */
  function createLaunch(
    address token,
    uint216 ints,
    uint256 tokensToDeposit,
    uint256 tokensForSale,
    // uint256 tokensForPrivateSale,
    // uint256 vestingRate,
    // bool privateRoundIsVested,
    // bool hasPrivateRound,
    bool hasPublicRound,
    uint8[] memory icon
    // address[] memory allowedContributors
  ) public override {
    if (_successfulLaunchCount == 0) {
      require(msg.sender == getOwner(), "Only the owner can create the first launch");
    }

    LaunchpaidLaunch launch = new LaunchpaidLaunch(
      token,
      address(this)
    );

    // deposit the tokens
    IERC20 _token = IERC20(token);
    uint256 oldBalance = _token.balanceOf(address(launch));
    _token.transferFrom(msg.sender, address(launch), tokensToDeposit);
    uint256 tokensReceived = _token.balanceOf(address(launch)) - oldBalance;
    require(tokensReceived == tokensToDeposit, "Lost tokens during transfer");
    launch.setTokensToDeposit(tokensReceived);
    launch.setTokensForSale(tokensForSale);
    // launch.setTokensForPrivateSale(tokensForPrivateSale);
    launch.setPercentToLiq(uint8(ints >> 112));
    // launch.setVestingRate(vestingRate);
    // launch.setPrivateRoundIsVested(privateRoundIsVested);
    // launch.setHasPrivateRound(hasPrivateRound);
    launch.setHasPublicRound(hasPublicRound);
    // launch.allowContributors(allowedContributors);
    launch.setTimes(uint48(ints), uint16(ints >> 48), uint48(ints >> 64));
    launch.setCaps(uint32(ints >> 120), uint32(ints >> 152), uint32(ints >> 184));
    launch.setIcon(icon);

    uint40 id = launchCount++;
    launches[id] = launch;

    emit LaunchCreated(id, address(launches[id]));
  }

  function getLaunchData(uint40 id, bool activeOnly) external view override returns (
    bool active,
    address launchContract,
    address token,
    uint256 tokensForSale,
    uint48 beginsAt,
    uint48 endsAt,
    uint32 softCap,
    uint32 hardCap,
    uint8 percentToLiq
  ){
    active = launches[id].active();

    if (!activeOnly || active) {
      launchContract = address(launches[id]);
      token = launches[id].token();
      tokensForSale = launches[id].tokensForSale();
      beginsAt = launches[id].beginsAt();
      endsAt = launches[id].endsAt();
      softCap = launches[id].softCap();
      hardCap = launches[id].hardCap();
      percentToLiq = launches[id].percentToLiq();
    }
  }

  function getTokenData(address token) external view override returns (
    string memory name,
    string memory symbol,
    uint8 decimals,
    uint256 totalSupply,
    uint256 balance
  ){
    return Util.getTokenData(token);
  }

  function getFeatured(address wallet) public view override returns (uint40) {
    return _featured[wallet];
  }

  function getFeatured() public view override returns (uint40) {
    return getFeatured(msg.sender);
  }

  function setFeatured(uint40 launch) external override {
    _featured[msg.sender] = launch;
  }
}
