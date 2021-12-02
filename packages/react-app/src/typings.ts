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
