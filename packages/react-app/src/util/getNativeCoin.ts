// import { BigNumber } from '@ethersproject/bignumber'
import { getNetworkDataByChainId } from '.'
import { NetworkData, TokenData } from '../typings'

export default function getNativeCoin(chainId: number): TokenData {
  return ((getNetworkDataByChainId(chainId) || {}) as NetworkData).nativeCurrency || {}
}
