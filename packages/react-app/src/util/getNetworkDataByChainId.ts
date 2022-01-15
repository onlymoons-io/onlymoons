import { BigNumber } from 'ethers'
import { NetworkData } from '../typings'

const networks: Record<number, NetworkData> = {
  56: {
    chainId: 56,
    name: 'Binance Smart Chain',
    shortName: 'BSC',
    nativeCurrency: {
      address: '-',
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://bscscan.com/',
    rpcURL: 'https://bsc-dataseed.binance.org/',
    icon: '/bsc.png',
    isTestNet: false,
  },
  97: {
    chainId: 97,
    name: 'Binance Smart Chain (TESTNET)',
    shortName: 'BSC',
    nativeCurrency: {
      address: '-',
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://testnet.bscscan.com/',
    rpcURL: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    icon: '/bsc.png',
    isTestNet: true,
  },
  588: {
    chainId: 588,
    name: 'Metis Stardust (TESTNET)',
    shortName: 'Metis',
    nativeCurrency: {
      address: '-',
      name: 'Metis',
      symbol: 'METIS',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://stardust-explorer.metis.io/',
    rpcURL: 'https://stardust.metis.io/?owner=588',
    icon: '/metis.png',
    isTestNet: true,
  },
  1088: {
    chainId: 1088,
    name: 'Metis Andromeda',
    shortName: 'Metis',
    nativeCurrency: {
      address: '-',
      name: 'Metis',
      symbol: 'METIS',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://andromeda-explorer.metis.io/',
    rpcURL: 'https://andromeda.metis.io/?owner=1088',
    icon: '/metis.png',
    isTestNet: false,
  },
}

export default function getNetworkDataByChainId(chainId: number): NetworkData | undefined {
  return networks[chainId]
}
