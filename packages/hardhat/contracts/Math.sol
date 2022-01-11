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

library Math {
  function clamp8(uint8 n, uint8 min, uint8 max) pure internal returns (uint8) {
    return n > min ? n < max ? n : max : min;
  }

  function clamp16(uint16 n, uint16 min, uint16 max) pure internal returns (uint16) {
    return n > min ? n < max ? n : max : min;
  }

  /**
   * @dev Calculate x * y / scale rounding down.
   *
   * https://ethereum.stackexchange.com/a/79736
   */
  function mulScale(uint256 x, uint256 y, uint128 scale) pure internal returns (uint256) {
    uint256 a = x / scale;
    uint256 b = x % scale;
    uint256 c = y / scale;
    uint256 d = y % scale;

    return a * c * scale + a * d + b * c + b * d / scale;
  }

  /**
   * @return `numerator` percentage of `denominator`
   *
   * https://ethereum.stackexchange.com/a/18877
   * https://stackoverflow.com/a/42739843
   */
  function percent(uint256 numerator, uint256 denominator, uint256 precision) pure internal returns (uint256) {
    // caution, check safe-to-multiply here
    // NOTE - solidity 0.8 and above throws on overflows automatically
    uint256 _numerator = numerator * 10 ** (precision+1);
    // with rounding of last digit
    return ((_numerator / denominator) + 5) / 10;
  }
}
