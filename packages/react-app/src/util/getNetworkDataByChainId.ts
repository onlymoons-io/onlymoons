import { BigNumber } from 'ethers'
import { NetworkData } from '../typings'

export const networks: Record<number, NetworkData> = {
  56: {
    chainId: 56,
    name: 'Binance Smart Chain',
    shortName: 'BSC',
    nativeCurrency: {
      address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://bscscan.com/',
    rpcURL: 'https://bsc-dataseed.binance.org/',
    icon: '/bsc.png',
    isTestNet: false,
    supportedLiquidityPairTokens: [
      {
        address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
        // pair w/ USDT on pancakeswap
        stablePair: '0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE',
      },
    ],
  },
  97: {
    chainId: 97,
    name: 'Binance Smart Chain (testnet)',
    shortName: 'BSC (testnet)',
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
    supportedLiquidityPairTokens: [],
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
    supportedLiquidityPairTokens: [],
  },
  1088: {
    chainId: 1088,
    name: 'Metis Andromeda',
    shortName: 'Metis',
    nativeCurrency: {
      address: '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000',
      name: 'Metis',
      symbol: 'METIS',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://andromeda-explorer.metis.io/',
    rpcURL: 'https://andromeda.metis.io/?owner=1088',
    icon: '/metis.png',
    isTestNet: false,
    supportedLiquidityPairTokens: [
      // Metis
      {
        address: '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000',
        // pair w/ m.USDT on tethys
        stablePair: '0x8121113eB9952086deC3113690Af0538BB5506fd',
      },
      // WMETIS
      {
        address: '0x75cb093E4D61d2A2e65D8e0BBb01DE8d89b53481',
        // pair w/ m.USDT on standard.tech
        stablePair: '0x6e90e50c8A04824104dB4B456b7EdEa3469d9b5F',
      },
      // m.USDT
      {
        address: '0xbB06DCA3AE6887fAbF931640f67cab3e3a16F4dC',
        // pair w/ Metis on tethys
        stablePair: '0x8121113eB9952086deC3113690Af0538BB5506fd',
      },
      // m.USDC
      {
        address: '0xEA32A96608495e54156Ae48931A7c20f0dcc1a21',
        // pair w/ Metis on tethys
        stablePair: '0xDd7dF3522a49e6e1127bf1A1d3bAEa3bc100583B',
      },
    ],
  },
}

export default function getNetworkDataByChainId(chainId: number): NetworkData | undefined {
  return networks[chainId]
}
