import { BigNumber } from 'ethers'

export interface TokenData {
  address: string
  name: string
  symbol: string
  decimals: number
  balance: BigNumber
}

export interface TokenLockData {
  lockOwner: string
  id: number
  contractAddress: string
  token: string
  isLpToken: boolean
  createdBy: string
  createdAt: number
  unlockTime: number
  balance: BigNumber
  totalSupply: BigNumber
}

export interface LPLockData {
  hasLpData: boolean
  id: number
  token0: string
  token1: string
  balance0: BigNumber
  balance1: BigNumber
  price0: BigNumber
  price1: BigNumber
}

export interface StakingData {
  id: number
  /** address contractAddress */
  contractAddress: string
  /** address stakedToken */
  stakedToken: string
  /** string memory name */
  name: string
  /** uint8 decimals */
  decimals: number
  /** uint256 totalStaked */
  totalStaked: BigNumber
  /** uint256 totalRewards */
  totalRewards: BigNumber
  /** uint256 totalClaimed */
  totalClaimed: BigNumber
}

export interface StakingDataForAccount {
  /** uint256 amount */
  amount: BigNumber
  /** uint40 lastClaimedBlock */
  lastClaimedBlock: number
  /** uint40 lastClaimedAt */
  lastClaimedAt: number
  lastClaimedDeposit: number
  /** uint256 pending */
  pending: BigNumber
  /** uint256 totalClaimed */
  totalClaimed: BigNumber
}

export interface GlobalStakingData {
  // bool ready,
  ready: boolean
  // address mainToken,
  mainToken: string
  // uint40 soloStakingId,
  soloStakingId: number
  // uint40 lpStakingId,
  lpStakingId: number
  // uint16 rewardsRatio
  rewardsRatio: number
}
