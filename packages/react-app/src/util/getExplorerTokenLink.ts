import getNetworkDataByChainId from './getNetworkDataByChainId'
import { NetworkData } from '../typings'

export default function getExplorerTokenLink(chainId: number, address: string) {
  const { explorerURL } = (getNetworkDataByChainId(chainId) || getNetworkDataByChainId(56)) as NetworkData

  // so far these are all the same URLs so a switch isn't needed
  return `${explorerURL}token/${address}`
}
