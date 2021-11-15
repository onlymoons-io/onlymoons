import { BigNumber } from 'ethers'

export interface TokenData {
  address: string
  name: string
  symbol: string
  decimals: number
  balance: BigNumber
}

export interface TokenLockData {
  owner: string
  id: number
  contractAddress: string
  token: string
  createdBy: string
  createdAt: number
  unlockTime: number
  tokenBalance: BigNumber
  totalSupply: BigNumber
}

export interface LPLockData {
  id: number
  token0: string
  token1: string
  balance0: BigNumber
  balance1: BigNumber
  price0: BigNumber
  price1: BigNumber
}
