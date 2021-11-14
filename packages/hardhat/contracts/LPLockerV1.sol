// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import { Ownable } from "./Ownable.sol";
import { IERC20 } from "./library/IERC20.sol";
import { IUniswapV2Pair } from "./library/Dex.sol";
import { TokenLockerV1 } from "./TokenLockerV1.sol";

contract LPLockerV1 is TokenLockerV1 {
  constructor(
    uint40 id_,
    address owner_,
    address pairAddress_,
    uint32 unlockTime_
  ) TokenLockerV1(
    id_,
    owner_,
    pairAddress_,
    unlockTime_
  ){
    _pair = IUniswapV2Pair(pairAddress_);
  }
  
  IUniswapV2Pair private _pair;

  function getLPLockData() external view returns (
    uint40 id,
    address token0,
    address token1,
    uint256 balance0,
    uint256 balance1,
    uint256 price0,
    uint256 price1
  ) {
    id = _id;
    token0 = _pair.token0();
    token1 = _pair.token1();

    IERC20 erc0 = IERC20(token0);
    IERC20 erc1 = IERC20(token1);

    balance0 = erc0.balanceOf(address(_pair));
    balance1 = erc1.balanceOf(address(_pair));

    price0 = _pair.price0CumulativeLast();
    price1 = _pair.price1CumulativeLast();
  }
}
