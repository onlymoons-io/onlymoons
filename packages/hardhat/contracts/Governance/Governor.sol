// SPDX-License-Identifier: GPL-3.0+

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

import { IGovernor } from "./IGovernor.sol";
import { OwnableV2 } from "../Control/OwnableV2.sol";

contract Governor is IGovernor, OwnableV2 {
  /**
   * @param owner_ address that owns this instance of Governor
   * @param votingTokens length must match votingTokenWeights
   * @param votingTokenWeights length must match votingTokens
   */
  constructor(address owner_, address[] memory votingTokens, uint256[] memory votingTokenWeights) OwnableV2(owner_) {
    _setWeightedTokens(votingTokens, votingTokenWeights);
  }

  mapping(uint16 => uint256) internal _weightedTokens;
  mapping(address => uint16) internal _weightedTokenAddressMap;
  uint16 internal _weightedTokenCount;

  function _addWeightedToken(address tokenAddress, uint256 weight) internal virtual {
    uint16 id = ++_weightedTokenCount;
    _weightedTokens[id] = weight;
    _weightedTokenAddressMap[tokenAddress] = id;
  }

  function addWeightedToken(address tokenAddress, uint256 weight) external override onlyOwner {
    _addWeightedToken(tokenAddress, weight);
  }

  function _setWeightedTokens(address[] memory votingTokens, uint256[] memory votingTokenWeights) internal virtual {
    require(
      votingTokens.length > 0 && votingTokens.length == votingTokenWeights.length,
      "votingTokens_ and votingTokenWeights_ length must match"
    );

    // reset count when wiping with new token data
    _weightedTokenCount = 0;

    // no need to worry about running out of gas
    for (uint16 i = 0; i < votingTokens.length; i++)
      _addWeightedToken(votingTokens[i], votingTokenWeights[i]);
  }

  function setWeightedTokens(address[] memory votingTokens, uint256[] memory votingTokenWeights) external override onlyOwner {
    _setWeightedTokens(votingTokens, votingTokenWeights);
  }

  function _getTokenWeight(address tokenAddress) internal view virtual returns (uint256) {
    uint16 id = _weightedTokenAddressMap[tokenAddress];

    return id > 0 && id <= _weightedTokenCount ? _weightedTokens[id] : 0;
  }

  function getTokenWeight(address tokenAddress) external view override returns (uint256) {
    return _getTokenWeight(tokenAddress);
  }
}
