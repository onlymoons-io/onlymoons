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

import { Governable } from "./Governable.sol";
import { IUniswapV2Router02 } from "./library/Dex.sol";
import { IERC20 } from "./library/IERC20.sol";

struct DexRouterInfoInput {
  string name;
  address contractAddress;
}

struct DexRouterInfo {
  string name;
  IUniswapV2Router02 router;
}

contract MultipassSwap is Governable {
  constructor(address owner_, string[] memory dexRouterNames_, address[] memory dexRouterAddresses_) Governable(owner_) {
    require(
      dexRouterNames_.length == dexRouterAddresses_.length,
      "Dex router name and address array size must match"
    );

    for (uint256 i = 0; i < dexRouterNames_.length; i++) {
      _addDexRouter(dexRouterNames_[i], dexRouterAddresses_[i]);
    }
  }

  DexRouterInfo[] private _dexRouters;

  function dexRouters() external view returns (string[] memory names, address[] memory addresses) {
    names = new string[](_dexRouters.length);
    addresses = new address[](_dexRouters.length);

    for (uint256 i = 0; i < _dexRouters.length; i++) {
      names[i] = _dexRouters[i].name;
      addresses[i] = address(_dexRouters[i].router);
    }
  }

  function _addDexRouter(string memory name_, address contractAddress_) private {
    _dexRouters.push(
      DexRouterInfo({
        name: name_,
        router: IUniswapV2Router02(contractAddress_)
      })
    );
  }

  function _removeDexRouter(address contractAddress_) private {

  }

  function addDexRouter(uint40 id_, string memory name_, address contractAddress_) onlyCanGovern(id_) external {
    _addDexRouter(name_, contractAddress_);
  }

  function removeDexRouter(uint40 id_, address contractAddress_) onlyCanGovern(id_) external {
    _removeDexRouter(contractAddress_);
  }

  function _getDexRouterByAddress(address contractAddress) private view returns (DexRouterInfo memory) {
    for (uint256 i = 0; i < _dexRouters.length; i++) {
      if (contractAddress == address(_dexRouters[i].router)) {
        return _dexRouters[i];
      }
    }

    revert("Can't find dex router");
  }

  /**
   * @dev single router swap.
   * this isn't really necessary, since we can call this normally in the
   * frontend with the router contract. however, providing this function makes
   * it possible to do single & dual router swaps without approving 2 contracts.
   */
  function swap1(
    uint256 amountIn,
    uint256 amountOutMin,
    address inRouter,
    address inTokenAddress,
    address outTokenAddress
  ) external {

  }

  /**
   * @dev dual router swap.
   * this requires approving both the input & intermediate tokens
   */
  function swap2(
    uint256 amountIn,
    uint256 amountOutMin,
    uint256 intermediateOutMin,
    address inRouter,
    address outRouter,
    address[] calldata inPath,
    address[] calldata outPath,
    uint256 deadline
  ) external {
    require(inPath[inPath.length - 1] == outPath[0], "Intermediate token mismatch");

    // get the IERC20 instance of intermediate token so we can check the balance.
    // the intermediate token will be the last address in `inPath`
    IERC20 intermediateToken = IERC20(inPath[inPath.length - 1]);

    // track the initial intermediate balance so we can tell how much was received
    uint256 oldIntermediateBalance = intermediateToken.balanceOf(msg.sender);
    
    // make the first swap.
    // this gives us the intermediate token.
    _getDexRouterByAddress(inRouter).router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
      amountIn,
      // minimum intermediate tokens received (intermediate slippage)
      intermediateOutMin,
      // in path - note that we're passing it in, instead of
      // hardcoding so we can find the best route in the frontend
      inPath,
      msg.sender,
      deadline
    );

    // make the second swap.
    // this trades the intermediate token for the desired token.
    _getDexRouterByAddress(outRouter).router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
      // swap the exact amount of intermediate tokens received from the first swap
      intermediateToken.balanceOf(msg.sender) - oldIntermediateBalance,
      // minimum desired tokens received (final slippage)
      amountOutMin,
      // in path - note that we're passing it in, instead of
      // hardcoding so we can find the best route in the frontend
      outPath,
      msg.sender,
      deadline
    );
  }
}
