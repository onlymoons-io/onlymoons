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

import { IERC20 } from "./library/IERC20.sol";
import { IUniswapV2Pair } from "./library/Dex.sol";

library Util {
  function getTokenData(address address_) external view returns (
    string memory name,
    string memory symbol,
    uint8 decimals,
    uint256 totalSupply,
    uint256 balance
  ){
    IERC20 _token = IERC20(address_);

    name = _token.name();
    symbol = _token.symbol();
    decimals = _token.decimals();
    totalSupply = _token.totalSupply();
    balance = _token.balanceOf(msg.sender);
  }

  /**
   * @dev NOTE - this throws an error on false, instead of returning false,
   * but can still be used the same way on frontend.
   */
  function isLpToken(address address_) external view returns (bool) {
    IUniswapV2Pair pair = IUniswapV2Pair(address_);

    return pair.token0() != address(0) && pair.token1() != address(0);
  }

  function getLpData(address address_) external view returns (
    address token0,
    address token1,
    uint256 balance0,
    uint256 balance1,
    uint256 price0,
    uint256 price1
  ) {
    IUniswapV2Pair _pair = IUniswapV2Pair(address_);

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
