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

import { IStakingManagerV1 } from "./IStakingManagerV1.sol";
import { Ownable } from "./Ownable.sol";
import { Pausable } from "./Pausable.sol";
import { IDCounter } from "./IDCounter.sol";
import { StakingV1 } from "./StakingV1.sol";
// import { Math } from "./Math.sol";
import { IERC20 } from "./library/IERC20.sol";

contract StakingManagerV1 is IStakingManagerV1, Ownable, Pausable, IDCounter {
  constructor() Ownable(_msgSender()) {
    //
  }

  uint40 private constant UNSET_ID = type(uint40).max;

  uint40 private _soloStakingId = UNSET_ID;
  uint40 private _lpStakingId = UNSET_ID;

  IERC20 private _soloStakingToken;
  IERC20 private _lpStakingToken;

  mapping(uint40 => StakingV1) private _staking;

  function setSoloStakingId(uint40 id) public override onlyOwner {
    _soloStakingId = id;

    (address stakedToken,,,,,) = _staking[_soloStakingId].getStakingData();

    _soloStakingToken = IERC20(stakedToken);
  }

  function setLpStakingId(uint40 id) public override onlyOwner {
    _lpStakingId = id;

    (address stakedToken,,,,,) = _staking[_lpStakingId].getStakingData();

    _lpStakingToken = IERC20(stakedToken);
  }

  function _ready() internal view returns (bool) {
    return _soloStakingId != UNSET_ID && _lpStakingId != UNSET_ID;
  }

  function _createStaking(
    address tokenAddress_,
    string memory name_,
    uint16 lockDurationDays_
  ) internal {
    uint40 id = _next();

    _staking[id] = new StakingV1(
      _msgSender(),
      tokenAddress_,
      name_,
      lockDurationDays_
    );

    emit StakingCreated(id, address(_staking[id]));
  }

  function createStaking(
    address tokenAddress_,
    string memory name_,
    uint16 lockDurationDays_
  ) external override onlyOwner onlyNotPaused {
    _createStaking(tokenAddress_, name_, lockDurationDays_);
  }

  function getStakingData(uint40 id) external view override returns (
    address contractAddress,
    address stakedToken,
    string memory name,
    uint8 decimals,
    uint256 totalStaked,
    uint256 totalRewards,
    uint256 totalClaimed
  ){
    (
      stakedToken,
      name,
      decimals,
      totalStaked,
      totalRewards,
      totalClaimed
    ) = _staking[id].getStakingData();

    contractAddress = address(_staking[id]);
  }

  function getGlobalStakingData() public view override returns (
    bool ready,
    address mainToken,
    uint40 soloStakingId,
    uint40 lpStakingId,
    uint16 liquidityRatio,
    uint16 rewardsRatio
  ) {
    ready = _ready();
    mainToken = address(_soloStakingToken);
    soloStakingId = _soloStakingId;
    lpStakingId = _lpStakingId;
    liquidityRatio = getLiquidityRatio();
    if (liquidityRatio < 1000) {
      // this maps to 0-1000 to 0-5000
      rewardsRatio = liquidityRatio * 5;
      // rewardsRatio = 5000 - ((1000 - liquidityRatio) * 5);
    } else if (liquidityRatio > 1000) {
      // NOTE this will reach a maximum of 9500, not 10000
      rewardsRatio = 5000 + ((liquidityRatio - 1000) / 2);
    } else {
      rewardsRatio = 5000;
    }
  }

  function getLiquidityRatio() public view override returns (uint16) {
    if (!_ready()) {
      return 1000;
    }

    uint256 ratio = _soloStakingToken.balanceOf(address(_lpStakingToken)) * 10000 / _soloStakingToken.totalSupply();
    return uint16(ratio < 10000 ? ratio : 10000);
  }
}
