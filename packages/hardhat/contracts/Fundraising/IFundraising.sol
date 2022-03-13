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

import { IPausable } from "../IPausable.sol";

interface IFundraising is IPausable {
  function getTitle() external view returns(string memory);
  function setTitle(string memory value) external;
  function getDescription() external view returns (string memory);
  function setDescription(string memory value) external;
  function setTitleAndDescription(
    string memory title_,
    string memory description_
  ) external;
  function getEndsAt() external view returns (uint40);
  function getTotalAmountRaised() external view returns (uint256);
  function getNumContributors() external view returns (uint40);
  function claim() external;
  function getData() external view returns (
    string memory title_,
    string memory description_,
    uint40 endsAt_,
    uint256 totalAmountRaised_,
    uint40 numContributors_
  );
  // function deposit() external payable;
}
