import { BigNumber } from '@ethersproject/bignumber'
import { TokenData } from '../typings'

export default function getNativeCoin(chainId: number): TokenData {
  switch (chainId) {
    case 56:
    case 97:
    default:
      return {
        address: '-',
        name: 'Binance Coin',
        symbol: 'BNB',
        decimals: 18,
        balance: BigNumber.from(0),
      }
  }
}
