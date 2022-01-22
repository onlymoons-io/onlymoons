import getNetworkDataByChainId from './getNetworkDataByChainId'
import { NetworkData } from '../typings'

export default function getExplorerContractLink(chainId: number, address: string) {
  const { explorerURL } = (getNetworkDataByChainId(chainId) || getNetworkDataByChainId(56)) as NetworkData

  switch (chainId) {
    default:
      // use this to match bscscan, etherscan, etc
      return `${explorerURL}address/${address}#code`
    case 122: // fuse mainnet
    case 123: // fuse testnet
    case 588: // metis stardust
    case 1088: // metis andromeda
      return `${explorerURL}address/${address}`
  }
}
