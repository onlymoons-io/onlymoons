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

import { IERC20 } from "./library/IERC20.sol";
import { IUniswapV2Factory, IUniswapV2Router02, IUniswapV2Pair } from "./library/Dex.sol";

/**
 * track stats of any token.
 */
contract TokenStats {
  constructor(address tokenAddress_, address routerAddress_, address[] memory burnAddresses_) {
    _token = IERC20(tokenAddress_);
    _router = IUniswapV2Router02(routerAddress_);
    _weth = IERC20(_router.WETH());
    _pair = IUniswapV2Pair(
      IUniswapV2Factory(_router.factory())
        .getPair(
          tokenAddress_,
          _router.WETH()
        )
    );
    _burnAddresses = burnAddresses_;
  }
  
  IERC20 private _token;
  IERC20 private _weth;
  IUniswapV2Pair private _pair;
  IUniswapV2Router02 private _router;
  address[] private _burnAddresses;
  
  /**
   * @dev retrieves stats for a token
   */
  function getStats() public view returns (
    string memory name,
    string memory symbol,
    uint256 balance,
    uint256 totalSupply,
    uint256 burned,
    uint8 decimals,
    uint256 liquidityAmount,
    uint256 liquidityWeth,
    uint256 liquidityTokens
  ){
    name = _token.name();
    symbol = _token.symbol();
    balance = _token.balanceOf(msg.sender);
    totalSupply = _token.totalSupply();
    burned = 0;
    // add up all the burn addresses
    for (uint256 i = 0; i < _burnAddresses.length; i++) {
      burned += _token.balanceOf(_burnAddresses[i]);
    }
    decimals = _token.decimals();
    liquidityAmount = _pair.totalSupply();
    liquidityWeth = _weth.balanceOf(address(_pair));
    liquidityTokens = _token.balanceOf(address(_pair));
  }
}
