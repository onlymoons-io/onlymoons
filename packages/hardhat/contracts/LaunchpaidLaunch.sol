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

import { ILaunchpaidLaunch } from "./interfaces/ILaunchpaidLaunch.sol";
import { ILaunchpaidLauncher } from "./interfaces/ILaunchpaidLauncher.sol";
import { ILaunchpaidStaking } from "./interfaces/ILaunchpaidStaking.sol";
import { Contribution, Contributions } from "./Contributions.sol";
import { IUniswapV2Router02, IUniswapV2Factory } from "./library/Dex.sol";
import { IERC20 } from "./library/IERC20.sol";
import { Math } from "./Math.sol";

contract LaunchpaidLaunch is ILaunchpaidLaunch {
  constructor(
    // uint40 __id,
    address __token,
    address __launcherAddress
    
  ){
    // require(_hasPrivateRound || _hasPublicRound, "Private and/or public round required");

    _owner = msg.sender;
    // _id = __id;
    _token = IERC20(__token);
    _launcher = ILaunchpaidLauncher(__launcherAddress);
    _dexRouter = IUniswapV2Router02(_launcher.dexRouter());
    _lockerContract = ILaunchpaidStaking(_launcher.stakingContract());
  }

  /**
   *
   */
  IUniswapV2Router02 private _dexRouter;

  /**
   *
   */
  ILaunchpaidStaking private _lockerContract;

  /**
   *
   */
  ILaunchpaidLauncher private _launcher;

  /**
   *
   */
  IERC20 private _launchpadToken;

  /**
   * creator of this launch
   */
  address private _owner;

  /**
   * reference to token
   */
  IERC20 private _token;

  /**
   *
   */
  bool private _listed = false;

  /**
   * is the launch finalized? this is essentially success or
   * failure for the launch. if ended is true, and finalized
   * is false, then the launch failed. if ended and finalized
   * are both true, then the launch was successful.
   */
  bool private _finalized = false;

  /**
   *
   */
  bool private _hasPrivateRound = false;
  bool private _hasPublicRound = true;
  bool private _isPrivateRound = false;
  bool private _privateRoundIsVested = false;

  // TODO: we can optimize these ints better

  /**
   * numeric id for this launch. this starts at 1, not 0,
   * so that we can use a value of 0 to tell if the launch
   * exists or not.
   */
  // uint40 private _id;

  /**
   * 0-100 integer percent value.
   * default to 100.
   * if percent is 100, charge no fee (except normal gas fee).
   * if percent is below 100, calculate fee.
   */
  uint8 private _percentToLiq;

  /**
   * soft & hard cap, combined into a 64 bit int.
   * uint32 = soft cap
   * uint32 = hard cap
   * uint32 = private hard cap
   */
  uint96 private _cap;

  /**
   * time ints, combined into a 112 bit int.
   * uint48 = beginsAt
   * uint16 = duration
   * uint48 = liq lock duration
   */
  uint112 private _times;

  /**
   * return rate that gets passed into the vesting contract,
   * for private round orders only. this only works when
   * `_privateRoundIsVested` is true.
   */
  uint256 private _vestingRate;

  /**
   *
   */
  uint256 private _tokensToDeposit;
  uint256 private _tokensDeposited;

  /**
   * total number of tokens that are deposited
   */
  uint256 private _tokensForSale;

  /**
   * number of tokens allocated for private sale
   */
  uint256 private _tokensForPrivateSale;

  /**
   *
   */
  uint256 private _minContribution;

  /**
   *
   */
  uint256 private _maxContribution;

  /**
   * png encoded icon
   */
  uint8[] private _icon;

  /**
   * 
   */
  Contributions private _contributions;

  /**
   *
   */
  mapping(address => bool) private _allowedContributors;

  modifier onlyOwner() {
    require(_owner == msg.sender, "Unauthorized");
    _;
  }

  modifier onlyNotExpired() {
    require(uint48(block.timestamp) < endsAt(), "Expired");
    _;
  }

  modifier onlyNotListed() {
    require(!_listed, "Already listed");
    _;
  }

  // function id() public view override returns (uint40) {
  //   return _id;
  // }

  function owner() public view override returns (address) {
    return _owner;
  }

  function token() public view override returns (address) {
    return address(_token);
  }
  function setToken(address value) onlyOwner() onlyNotListed() public {
    _token = IERC20(value);
  }

  function active() public view override returns (bool) {
    return _listed && !ended();
  }

  function listed() public view override returns (bool) {
    return _listed;
  }

  function ended() public view override returns (bool) {
    return uint48(block.timestamp) >= endsAt()
      || _contributions.total + _minContribution > hardCap();
  }

  function refundable() public view override returns (bool) {
    if (!ended())
      return false; // already ended

    if (_contributions.wallets[msg.sender].claimed)
      return false; // already claimed

    // TODO - determine a situation to return true here
    return false;
  }

  function finalized() public view override returns (bool) {
    return _finalized;
  }

  function percentToLiq() public view override returns (uint8) {
    return _percentToLiq;
  }
  function setPercentToLiq(uint8 value) onlyOwner() onlyNotListed() public override {
    _percentToLiq = value;
  }

  function tokensToDeposit() public view override returns (uint256) {
    return _tokensToDeposit;
  }
  function setTokensToDeposit(uint256 value) onlyOwner() onlyNotListed() public {
    _tokensToDeposit = value;
  }
  function tokensDeposited() public view override returns (uint256) {
    return _tokensDeposited;
  }

  function tokensForSale() public view override returns (uint256) {
    return _tokensForSale;
  }
  function setTokensForSale(uint256 value) onlyOwner() onlyNotListed() public {
    _tokensForSale = value;
  }

  function tokensForPrivateSale() public view override returns (uint256) {
    return _tokensForPrivateSale;
  }
  function setTokensForPrivateSale(uint256 value) onlyOwner() onlyNotListed() public {
    _tokensForPrivateSale = value;
  }

  function vestingRate() public view returns (uint256) {
    return _vestingRate;
  }
  function setVestingRate(uint256 value) onlyOwner() onlyNotListed() public {
    _vestingRate = value;
  }

  function privateRoundIsVested() public view returns (bool) {
    return _privateRoundIsVested;
  }
  function setPrivateRoundIsVested(bool value) onlyOwner() onlyNotListed() public {
    _privateRoundIsVested = value;
  }

  function hasPrivateRound() public view returns (bool) {
    return _hasPrivateRound;
  }
  function setHasPrivateRound(bool value) onlyOwner() onlyNotListed() public {
    _hasPrivateRound = value;
  }

  function hasPublicRound() public view returns (bool) {
    return _hasPublicRound;
  }
  function setHasPublicRound(bool value) onlyOwner() onlyNotListed() public {
    _hasPublicRound = value;
  }

  function tokensSold() public view override returns (uint256) {
    return _contributions.tokens;
  }

  function minContribution() public view override returns (uint256) {
    return _minContribution;
  }
  function setMinContribution(uint256 value) onlyOwner() onlyNotListed() public override {
    _minContribution = value;
  }

  function maxContribution() public view override returns (uint256) {
    return _maxContribution;
  }
  function setMaxContribution(uint256 value) onlyOwner() onlyNotListed() public override {
    _maxContribution = value;
  }

  function beginsAt() public view override returns (uint48) {
    return uint48(_times);
  }
  function setBeginsAt(uint48 value) onlyOwner() onlyNotListed() public override {
    _times = uint112(value) | (uint112(duration()) << 48) | (uint112(liqLockDuration()) << 64);
  }

  function duration() public view override returns (uint16) {
    return uint16(_times >> 48);
  }
  function setDuration(uint16 value) onlyOwner() onlyNotListed() public override {
    _times = uint112(beginsAt()) | (uint112(value) << 48) | (uint112(liqLockDuration()) << 64);
  }

  function endsAt() public view override returns (uint48) {
    return beginsAt() + (uint48(duration()) * 60 * 60);
  }

  function liqLockDuration() public view override returns (uint48) {
    return uint48(_times >> 64);
  }
  function setLiqLockDuration(uint48 value) onlyOwner() onlyNotListed() public override {
    _times = uint112(beginsAt()) | (uint112(duration()) << 48) | (uint112(value) << 64);
  }

  function setTimes(
    uint48 __beginsAt,
    uint16 __duration,
    uint48 __liqLockDuration
  ) onlyOwner() onlyNotListed() public override {
    _times = uint112(__beginsAt) | (uint112(__duration) << 48) | (uint112(__liqLockDuration) << 64);
  }

  function softCap() public view override returns (uint32) {
    return uint32(_cap);
  }
  function setSoftCap(uint32 value) onlyOwner() onlyNotListed() public override {
    _cap = uint96(value) | (uint96(hardCap()) << 32) | (uint96(privateHardCap()) << 64);
  }

  function hardCap() public view override returns (uint32) {
    return uint32(_cap >> 32);
  }
  function setHardCap(uint32 value) onlyOwner() onlyNotListed() public override {
    _cap = uint96(softCap()) | (uint96(value) << 32) | (uint96(privateHardCap()) << 64);
  }

  function privateHardCap() public view override returns (uint32) {
    return uint32(_cap >> 64);
  }
  function setPrivateHardCap(uint32 value) onlyOwner() onlyNotListed() public override {
    _cap = uint96(softCap()) | (uint96(hardCap()) << 32) | (uint96(value) << 64);
  }

  function setCaps(
    uint32 __softCap,
    uint32 __hardCap,
    uint32 __privateHardCap
  ) onlyOwner() onlyNotListed() public override {
    _cap = uint96(__softCap) | (uint96(__hardCap) << 32) | (uint96(__privateHardCap) << 64);
  }

  function icon() public view override returns (uint8[] memory) {
    return _icon;
  }
  function setIcon(uint8[] memory value) onlyOwner() onlyNotListed() public override {
    _icon = value;
  }

  //

  function _allowContributors(address[] memory wallets) onlyOwner() onlyNotListed() private {
    for (uint256 i = 0; i < wallets.length; i++) {
      _allowedContributors[wallets[i]] = true;
    }
  }
  function allowContributors(address[] memory wallets) onlyOwner() onlyNotListed() public override {
    _allowContributors(wallets);
  }

  function revokeContributors(address[] memory wallets) onlyOwner() onlyNotListed() external override {
    for (uint256 i = 0; i < wallets.length; i++) {
      _allowedContributors[wallets[i]] = false;
    }
  }

  function isAllowedToContribute(address wallet) external view override returns (bool) {
    if (!_hasPrivateRound || !_isPrivateRound) {
      return true;
    }

    return _allowedContributors[wallet];
  }

  function getTotalContributions() public view override returns (
    uint256 amount,
    uint256 tokens,
    uint24 numContributors,
    uint24 numContributions
  ){
    amount = _contributions.total;
    tokens = _contributions.tokens;
    numContributors = _contributions.numContributors;
    numContributions = uint24(_contributions.contributions.length);
  }

  function getContributionsForAddress(
    address _address
  ) public view override returns (
    uint256 amount,
    uint256 tokens,
    uint24 numContributions
  ){
    amount = _contributions.wallets[_address].amountContributed;
    tokens = _contributions.wallets[_address].tokens;
    numContributions = _contributions.wallets[_address].numContributions;
  }

  function _createAndLockLiquidity() private {
    // do we need to swap eth for weth?

    // TODO - replace this with real values
    uint256 _amountDeposited = _tokensForSale;
    // there might be a chance of precision errors causing
    // sold tokens to be barely above tokensForSale,
    // so in that case, consider unsoldTokens to be 0
    uint256 unsoldTokens = _contributions.tokens >= _tokensForSale
      ? 0
      : _tokensForSale - _contributions.tokens;
    uint256 percentUnsold = Math.percent(unsoldTokens, _tokensForSale, 8);
    
    // amount of tokens to pair.
    // we need to subtract unsoldTokens % from here
    // to maintain the original price.
    uint256 amountOfTokensScheduled = _amountDeposited - _tokensForSale;
    uint256 amountOfTokens = amountOfTokensScheduled - Math.mulScale(
      // since we used precision of 8 above, we should
      // add 8 decimals to the amount for this calculation,
      // so we can preserve precision.
      amountOfTokensScheduled * 10**8,
      percentUnsold,
      // also add 8 decimal places to a base value of 100
      100 * 10**8
    );

    // create the liquidity.
    // use 100% of the eth stored in the contract
    uint256 liquidity;
    (,,liquidity) = _dexRouter.addLiquidityETH{value: address(this).balance}(
      address(_token),
      amountOfTokens,
      // accept any amount of slippage. should we change this...?
      0,
      0,
      address(this),
      block.timestamp
    );

    // TODO - lock the lp tokens

    // burn any remaining tokens.
    // send to 0x00..01 instead of 0x00..00, because
    // metamask doesn't allow you to send to 0x00..00,
    // so this gives a higher chance of all burned tokens
    // winding up in the same wallet.
    _token.transferFrom(address(this), address(1), _token.balanceOf(address(this)));
  }

  function list() onlyOwner() onlyNotListed() external override {
    require(
      uint48(block.timestamp) <= beginsAt(),
      "beginsAt has already passed"
    );
    require(
      _tokensForSale != 0 && _tokensForSale == _token.balanceOf(address(this)),
      "Tokens not deposited"
    );

    // TODO - take listing fee

    _listed = true;
  }

  function finalize() onlyOwner() external override {
    require(!_finalized, "Already finalized");
    require(uint48(block.timestamp) >= endsAt(), "Not ended yet");

    // create & lock liquidity
    _createAndLockLiquidity();

    // mark that the launch is finalized
    _finalized = true;
  }

  function claim() external override {
    require(_finalized, "Not finalized");
    require(!_contributions.wallets[msg.sender].claimed, "Already claimed");

    // if this is the last claim, there's a chance of some precision error
    // leaving slightly less tokens than we need, so we need to allow for it.
    // TODO - come up with a solution that makes this never happen,
    // because this kind of sucks for whoever claims last.
    uint256 amount = _contributions.wallets[msg.sender].tokens;
    uint256 maxAmount = _token.balanceOf(address(this));
    uint256 amountToSend = amount > maxAmount ? maxAmount : amount;
    _token.transferFrom(address(this), msg.sender, amountToSend);

    _contributions.wallets[msg.sender].claimed = true;
  }

  function refund() external override {
    require(refundable(), "Not refundable");

    // make the transfer
    payable(address(msg.sender)).transfer(_contributions.wallets[msg.sender].amountContributed);

    // reset stats for this wallet, but preserve the remaining stats
    _contributions.wallets[msg.sender].amountContributed = 0;
    _contributions.wallets[msg.sender].tokens = 0;
    _contributions.wallets[msg.sender].numContributions = 0;
  }

  function tokensPerETH() public view override returns (uint256 privateRate, uint256 publicRate) {
    uint128 scale = uint128(10 ** _token.decimals());
    privateRate = Math.mulScale(_tokensForPrivateSale, privateHardCap(), scale);
    publicRate = Math.mulScale(_tokensForSale, hardCap(), scale);
  }

  // called when ether is sent to this contract
  receive() external payable {
    require(active(), "Not active");

    // only allow contributions if the hard cap isn't reached,
    // and check that this contribution won't put it above the cap
    require(
      _contributions.total + msg.value <= hardCap(),
      "This will exceed the hard cap for the launch"
    );

    require(
      _contributions.wallets[msg.sender].amountContributed + msg.value <= maxContribution(),
      "This will exceed the max contribution for the launch"
    );

    if (_hasPrivateRound && _isPrivateRound) {
      require(_allowedContributors[msg.sender], "Not allowed to contribute");
    } else if (!_isPrivateRound) {
      require(_hasPublicRound, "Launch does not have a public round");
    }

    // get the amount of tokens to receive
    uint256 privateRate;
    uint256 publicRate;
    (privateRate, publicRate) = tokensPerETH();
    // eth is always 18 decimals, but we need
    // to know how many decimals the token uses
    uint256 tokens = (
      _isPrivateRound ? privateRate : publicRate
    ) * (
      msg.value / 10**(18-_token.decimals())
    );
    
    // NOTE: this probably should never fail - it's here to help with development.
    // if it fails even once during testing, the above token calculation needs fixin.
    require(
      _contributions.tokens + tokens <= (_isPrivateRound ? _tokensForPrivateSale : _tokensForSale),
      "Not enough tokens to satisfy order"
    );

    _contributions.contributions.push(
      Contribution({
        wallet: msg.sender,
        amount: msg.value,
        tokens: tokens,
        timestamp: uint48(block.timestamp)
      })
    );

    _contributions.total += msg.value;
    _contributions.tokens += tokens;
    _contributions.wallets[msg.sender].amountContributed += msg.value;
    _contributions.wallets[msg.sender].numContributions++;
    _contributions.wallets[msg.sender].tokens += tokens;

    // if this is the first contribution from the sender,
    // increase the numContributions counter
    if (_contributions.wallets[msg.sender].numContributions == 1) {
      _contributions.numContributors++;
    }
  }
}
