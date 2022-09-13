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
import { IERC165 } from "./library/IERC165.sol";
import { IERC721 } from "./library/IERC721.sol";
import { INonfungiblePositionManager } from "./library/uniswap-v3/INonfungiblePositionManager.sol";
import { IUniswapV3Factory } from "./library/uniswap-v3/IUniswapV3Factory.sol";
import { IUniswapV3PoolState } from "./library/uniswap-v3/IUniswapV3PoolState.sol";

library UtilV2 {

  function isERC721(address address_) external view returns (bool) {
    try IERC165(address_).supportsInterface(type(IERC721).interfaceId) returns (bool isSupported) {
      return isSupported;
    } catch Error(string memory /* reason */) {
      return false;
    } catch (bytes memory /* reason */) {
      return false;
    }
  }

  /**
   * @dev this test isn't foolproof. it first checks for ERC721 implementation,
   * then checks for the existence of the .positions(tokenId) function.
   * if there is no error, it is considered uniswap v3 lp.
   */
  function isUniV3Lp(address address_) external view returns (bool) {
    try IERC165(address_).supportsInterface(type(IERC721).interfaceId) returns (bool isSupported) {
      if (!isSupported) {
        return false;
      }

      try INonfungiblePositionManager(address_).positions(123) {
        return true;
      } catch Error(string memory /* reason */) {
        return false;
      } catch (bytes memory /* reason */) {
        return false;
      }
    } catch Error(string memory /* reason */) {
      return false;
    } catch (bytes memory /* reason */) {
      return false;
    }
  }

  /**
   * @dev this will throw an error if address_ isn't an `INonfungiblePositionManager`
   */
  function getUniV3LpData(address address_, uint256 tokenId_) external view returns (
    address token0,
    address token1,
    uint24 fee,
    uint256 balance0,
    uint256 balance1,
    uint128 liquidity,
    address pool
  ) {
    INonfungiblePositionManager manager = INonfungiblePositionManager(address_);

    (,,token0,token1,fee,,,liquidity,,,,) = manager.positions(
      tokenId_
    );

    pool = IUniswapV3Factory(
      manager.factory()
    ).getPool(
      token0,
      token1,
      fee
    );

    // returns the total balance of the pool, not the portion of this position
    balance0 = IERC20(token0).balanceOf(pool);
    balance1 = IERC20(token1).balanceOf(pool);
  }
}
