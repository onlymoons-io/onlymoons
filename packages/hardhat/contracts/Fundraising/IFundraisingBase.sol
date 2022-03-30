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

import { IOwnableV2 } from "../Control/IOwnableV2.sol";
import { IPausable } from "../Control/IPausable.sol";

interface IFundraisingBase is IOwnableV2, IPausable {
  function getTitle() external view returns(string memory);
  function setTitle(string memory value) external;
  function getDescription() external view returns (string memory);
  function setDescription(string memory value) external;
  function setTitleAndDescription(
    string memory title,
    string memory description
  ) external;
  // function getEndsAt() external view returns (uint256);
  function getTotalAmountRaised(address tokenAddress) external view returns (uint256);
  function getNumContributors() external view returns (uint256);
  function claimEth() external;
  function claimToken(address tokenAddress) external;
  function claimAll() external;
  function getData() external view returns (
    uint8 fundraisingType,
    string memory title,
    string memory description,
    uint256[] memory data,
    uint256 numContributors
  );
  function isTokenAccepted(address tokenAddress) external view returns (bool);
}
