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

import { IGovernable } from "../Governance/IGovernable.sol";
import { IPausable } from "../Control/IPausable.sol";

interface IFees is IGovernable, IPausable {
  function feeAmountBase() external view returns (uint256);
  function setFeeAmountBase(uint256 value) external;
  function getFeeAmountForType(address sender, string memory feeType) external view returns (uint256);
  function getAdjustedFeeAmountForType(address sender, string calldata feeType) external view returns (uint256);
  function setFeeAmountForType(string memory feeType, uint256 amount) external;
  function setAddressExemptFromFees(address account, bool value) external;
  function isAddressExemptFromFees(address account) external view returns (bool);
  function feesDistributed() external view returns (uint256 total, uint256 treasury, uint256 staking);
  function treasuryFeeAddress() external view returns (address);
  function setTreasuryFeeAddress(address payable value) external;
  function stakingFeeAddress() external view returns (address);
  function setStakingFeeAddress(address payable value) external;
  function getFees() external view returns (uint16 treasuryFee, uint16 stakingFee);
  function setFees(uint16 treasuryFee, uint16 stakingFee) external;
}
