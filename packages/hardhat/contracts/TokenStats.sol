// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import { IERC20 } from "./library/IERC20.sol";
import { IUniswapV2Factory, IUniswapV2Router02, IUniswapV2Pair } from "./library/Dex.sol";

/**
 * track stats of any token.
 */
contract TokenStats {
    constructor(address tokenAddress_, address routerAddress_) {
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
    }
    
    IERC20 private _token;
    IERC20 private _weth;
    IUniswapV2Pair private _pair;
    IUniswapV2Router02 private _router;
    
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
        // add up all the burn addresses
        burned = _token.balanceOf(0x000000000000000000000000000000000000dEaD);
        burned += _token.balanceOf(address(0));
        burned += _token.balanceOf(address(1));
        // the contract itself is also a burn address in the case of OnlyMoons
        burned += _token.balanceOf(address(_token));
        decimals = _token.decimals();
        liquidityAmount = _pair.totalSupply();
        liquidityWeth = _weth.balanceOf(address(_pair));
        liquidityTokens = _token.balanceOf(address(_pair));
    }
}
