import { BigNumber } from 'ethers'

export interface TokenData {
  readonly address: string
  readonly name: string
  readonly symbol: string
  readonly decimals: number
  balance: BigNumber
}

export interface TokenLockData {
  readonly lockOwner: string
  readonly id: number
  readonly contractAddress: string
  readonly token: string
  readonly isLpToken: boolean
  readonly createdBy: string
  readonly createdAt: number
  readonly unlockTime: number
  readonly balance: BigNumber
  readonly totalSupply: BigNumber
}

export interface LPData {
  readonly token0: string
  readonly token1: string
  readonly balance0: BigNumber
  readonly balance1: BigNumber
  readonly price0: BigNumber
  readonly price1: BigNumber
}

export interface LPLockData extends LPData {
  readonly hasLpData: boolean
  readonly id: number
}

export interface StakingData {
  readonly id: number
  /** address contractAddress */
  readonly contractAddress: string
  /** uint8 stakingType */
  readonly stakingType: number
  /** address stakedToken */
  readonly stakedToken: string
  /** uint8 decimals */
  readonly decimals: number
  /** uint256 totalStaked */
  readonly totalStaked: BigNumber
  /** uint256 totalRewards */
  readonly totalRewards: BigNumber
  /** uint256 totalClaimed */
  readonly totalClaimed: BigNumber
}

export interface StakingDataForAccount {
  /** uint256 amount */
  readonly amount: BigNumber
  /** uint40 lastClaimedBlock */
  readonly lastClaimedBlock: number
  /** uint40 lastClaimedAt */
  readonly lastClaimedAt: number
  /** uint256 pending */
  readonly pendingRewards: BigNumber
  /** uint256 totalClaimed */
  readonly totalClaimed: BigNumber
}

export interface GlobalStakingData {
  // bool ready,
  readonly ready: boolean
  // address mainToken,
  readonly mainToken: string
  //
  readonly soloStakingAddress: string
  //
  readonly lpStakingAddress: string
  // uint16 rewardsRatio
  readonly rewardsRatio: number
  //
  readonly liquidityRatio: number
}

export interface SplitStakingRewardsData {
  // uint256 combinedRewards,
  readonly combinedRewards: BigNumber
  // uint256 soloStakingRewards,
  readonly soloStakingRewards: BigNumber
  // uint256 lpStakingRewards,
  readonly lpStakingRewards: BigNumber
  // uint256 distributorReward,
  readonly distributorReward: BigNumber
  // uint256 totalRewards,
  readonly totalRewards: BigNumber
  // uint256 waitingRewards,
  readonly waitingRewards: BigNumber
  // uint256 lastDistributionAt
  readonly lastDistributionAt: BigNumber
}

export interface AllRewardsForAddress {
  readonly pending: BigNumber
  readonly claimed: BigNumber
}

export interface LiquidityPair {
  readonly address: string
  /** for calculating value */
  readonly stablePair: string
}

export interface NetworkData {
  readonly chainId: number
  readonly name: string
  readonly shortName: string
  readonly urlName: string
  readonly nativeCurrency: TokenData
  readonly icon?: string
  readonly rpcURL: string
  readonly explorerURL: string
  readonly isTestNet: boolean
  readonly supportedLiquidityPairTokens: LiquidityPair[]
}

export interface BridgeDestination {
  readonly chainId: number
  readonly resources: Record<string, string>
}

export interface BridgeData {
  readonly bridge: string
  readonly erc20Handler: string
  readonly destinations: Array<BridgeDestination>
}
