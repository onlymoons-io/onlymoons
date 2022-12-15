import { BigNumber } from 'ethers'
import { NetworkData } from '../typings'

export const networks: Record<number, NetworkData> = {
  1: {
    chainId: 1,
    name: 'Ethereum',
    shortName: 'Ethereum',
    urlName: 'eth',
    nativeCurrency: {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      name: 'Eth',
      symbol: 'ETH',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://etherscan.io/',
    rpcURL: 'https://rpc.ankr.com/eth',
    icon: '/eth.png',
    isTestNet: false,
    supportedLiquidityPairTokens: [
      //
      {
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        // pair w/ USDC on uniswap v2
        stablePair: '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc',
      },
    ],
  },
  4: {
    chainId: 4,
    name: 'Ethereum Rinkeby (testnet)',
    shortName: 'Rinkeby',
    urlName: 'rinkeby',
    nativeCurrency: {
      address: '',
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://rinkeby.etherscan.io/',
    rpcURL: 'https://rinkeby.infura.io/v3/cfeb072b8469447e889da944481d5874',
    icon: '/eth.png',
    isTestNet: true,
    supportedLiquidityPairTokens: [],
  },
  25: {
    chainId: 25,
    name: 'Cronos',
    shortName: 'CRO',
    urlName: 'cro',
    nativeCurrency: {
      address: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',
      name: 'Cronos',
      symbol: 'CRO',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://cronoscan.com/',
    rpcURL: 'https://evm-cronos.crypto.org/',
    icon: '/cro.svg',
    isTestNet: false,
    supportedLiquidityPairTokens: [
      {
        address: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',
        // pair w/ USDC on https://mm.finance/
        stablePair: '0xa68466208F1A3Eb21650320D2520ee8eBA5ba623',
      },
    ],
  },
  56: {
    chainId: 56,
    name: 'Binance Smart Chain',
    shortName: 'BSC',
    urlName: 'bsc',
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
    urlName: 'bsctest',
    nativeCurrency: {
      address: '0xae13d989dac2f0debff460ac112a837c89baa7cd',
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://testnet.bscscan.com/',
    rpcURL: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    icon: '/bsc.png',
    isTestNet: true,
    supportedLiquidityPairTokens: [
      {
        address: '0xae13d989dac2f0debff460ac112a837c89baa7cd',
        // pair w/ USDT on https://pancake.kiemtienonline360.com/
        stablePair: '0xf855e52ecc8b3b795ac289f85f6fd7a99883492b',
      },
    ],
  },
  122: {
    chainId: 122,
    name: 'Fuse',
    shortName: 'Fuse',
    urlName: 'fuse',
    nativeCurrency: {
      address: '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629',
      name: 'Fuse',
      symbol: 'FUSE',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://explorer.fuse.io/',
    rpcURL: 'https://rpc.fuse.io/',
    icon: '/fuse.png',
    isTestNet: false,
    supportedLiquidityPairTokens: [
      {
        // WFUSE
        address: '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629',
        // WFUSE / USDT lp on app.fuse.fi
        stablePair: '0x8a81984D2DF356B49d182910bbB935897450d7e8',
      },
    ],
  },
  123: {
    chainId: 123,
    name: 'Fuse Spark (testnet)',
    shortName: 'Fuse (testnet)',
    urlName: 'fusetest',
    nativeCurrency: {
      address: '-',
      name: 'Spark',
      symbol: 'SPARK',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://explorer.fusespark.io/',
    rpcURL: 'https://rpc.fusespark.io/',
    icon: '/fuse.png',
    isTestNet: true,
    supportedLiquidityPairTokens: [],
  },
  137: {
    chainId: 137,
    name: 'Polygon',
    shortName: 'Polygon',
    urlName: 'polygon',
    nativeCurrency: {
      address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://polygonscan.com/',
    rpcURL: 'https://polygon-rpc.com/',
    icon: '/polygon.png',
    isTestNet: false,
    supportedLiquidityPairTokens: [
      // WMATIC
      {
        address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
        // pair w/ USDC on quickswap
        stablePair: '0x6e7a5FAFcec6BB1e78bAE2A1F0B612012BF14827',
      },
    ],
  },
  588: {
    chainId: 588,
    name: 'Metis Stardust (testnet)',
    shortName: 'Metis',
    urlName: 'metistest',
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
  592: {
    chainId: 592,
    name: 'Astar',
    shortName: 'Astar',
    urlName: 'astar',
    nativeCurrency: {
      address: '0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720',
      name: 'Astar',
      symbol: 'ASTR',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://blockscout.com/astar/',
    rpcURL: 'https://rpc.astar.network:8545',
    icon: '/astar.png',
    isTestNet: false,
    supportedLiquidityPairTokens: [
      // WAstar
      {
        address: '0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720',
        // pair w/ USDC on https://www.arthswap.org/
        stablePair: '0xBB1290c1829007F440C771b37718FAbf309cd527',
      },
      {
        address: '0xEcC867DE9F5090F55908Aaa1352950b9eed390cD',
        // pair w/ USDC on https://astar.exchange/
        stablePair: '0xA6E7448463dF706862E424208838047D8Aa0ED11',
      },
    ],
  },
  1088: {
    chainId: 1088,
    name: 'Metis Andromeda',
    shortName: 'Metis',
    urlName: 'metis',
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
      // // m.USDT
      // {
      //   address: '0xbB06DCA3AE6887fAbF931640f67cab3e3a16F4dC',
      //   // pair w/ Metis on tethys
      //   stablePair: '0x8121113eB9952086deC3113690Af0538BB5506fd',
      // },
      // // m.USDC
      // {
      //   address: '0xEA32A96608495e54156Ae48931A7c20f0dcc1a21',
      //   // pair w/ Metis on tethys
      //   stablePair: '0xDd7dF3522a49e6e1127bf1A1d3bAEa3bc100583B',
      // },
    ],
  },
  2000: {
    chainId: 2000,
    name: 'Dogechain',
    shortName: 'Dogechain',
    urlName: 'dogechain',
    nativeCurrency: {
      address: '0xB7ddC6414bf4F5515b52D8BdD69973Ae205ff101',
      name: 'Doge',
      symbol: 'DOGE',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://explorer.dogechain.dog/',
    // rpcURL: 'https://rpc.dogechain.dog',
    rpcURL: 'https://dogechain.ankr.com',
    icon: '/dogechain.png',
    isTestNet: false,
    supportedLiquidityPairTokens: [
      // DOGE
      {
        address: '0xB7ddC6414bf4F5515b52D8BdD69973Ae205ff101',
        // pair w/ USDC on https://dogeswap.org/
        stablePair: '0xa8E4040B7085A937b278e7aa95C36e9044CC6D9c',
      },
    ],
  },
  2001: {
    chainId: 2001,
    name: 'Milkomeda',
    shortName: 'Milkomeda',
    urlName: 'milkomeda',
    nativeCurrency: {
      address: '0xAE83571000aF4499798d1e3b0fA0070EB3A3E3F9',
      name: 'Wrapped ADA',
      symbol: 'WADA',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://explorer-mainnet-cardano-evm.c1.milkomeda.com/',
    rpcURL: 'https://rpc-mainnet-cardano-evm.c1.milkomeda.com',
    icon: '/milkomeda.png',
    isTestNet: false,
    supportedLiquidityPairTokens: [
      //
      {
        address: '0xAE83571000aF4499798d1e3b0fA0070EB3A3E3F9',
        stablePair: '0x0B46AD9e9B749c9D500C81a4975B1599a872Ebe8',
      },
    ],
  },
  7700: {
    chainId: 7700,
    name: 'Canto',
    shortName: 'Canto',
    urlName: 'canto',
    nativeCurrency: {
      address: '0x826551890Dc65655a0Aceca109aB11AbDbD7a07B',
      name: 'CANTO',
      symbol: 'CANTO',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://evm.explorer.canto.io/',
    rpcURL: 'https://jsonrpc.canto.nodestake.top/',
    icon: '/canto.png',
    isTestNet: false,
    supportedLiquidityPairTokens: [
      // CANTO
      {
        address: '0x826551890Dc65655a0Aceca109aB11AbDbD7a07B',
        // pair w/ USDC on cantoswap.fi
        stablePair: '0x628851EF2aAd2ACC4c4dD2E13fdceEBA0e5106bA',
      },
    ],
  },
  42161: {
    chainId: 42161,
    name: 'Arbitrum',
    shortName: 'Arbitrum',
    urlName: 'arbitrum',
    nativeCurrency: {
      address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://arbiscan.io/',
    rpcURL: 'https://arb1.arbitrum.io/rpc',
    icon: '/arbitrum.png',
    isTestNet: false,
    supportedLiquidityPairTokens: [
      // ETH
      {
        address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        // pair w/ USDT on https://app.sushi.com/
        stablePair: '0xCB0E5bFa72bBb4d16AB5aA0c60601c438F04b4ad',
      },
    ],
  },
  10001: {
    chainId: 10001,
    name: 'EthereumPoW',
    shortName: 'EthW',
    urlName: 'ethw',
    nativeCurrency: {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      name: 'ETHW-mainnet',
      symbol: 'ETHW',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://www.oklink.com/en/ethw/',
    rpcURL: 'https://mainnet.ethereumpow.org',
    icon: '/ethw.png',
    isTestNet: false,
    supportedLiquidityPairTokens: [
      // ETHW
      {
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        // pair w/ 0 on 0
        stablePair: '',
      },
    ],
  },
  43114: {
    chainId: 43114,
    name: 'Avalanche',
    shortName: 'AVAX',
    urlName: 'avax',
    nativeCurrency: {
      address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://snowtrace.io/',
    rpcURL: 'https://api.avax.network/ext/bc/C/rpc',
    icon: '/avax.png',
    isTestNet: false,
    supportedLiquidityPairTokens: [
      //
      {
        address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
        // pair w/ USDC.e on https://traderjoexyz.com/home#/
        stablePair: '0xA389f9430876455C36478DeEa9769B7Ca4E3DDB1',
      },
    ],
  },
  80001: {
    chainId: 43114,
    name: 'Polygon Mumbai (testnet)',
    shortName: 'Mumbai',
    urlName: 'mumbai',
    nativeCurrency: {
      address: '0x9c3c9283d3e44854697cd22d3faa240cfb032889',
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://mumbai.polygonscan.com/',
    rpcURL: 'https://rpc-mumbai.maticvigil.com/',
    icon: '/polygon.png',
    isTestNet: true,
    supportedLiquidityPairTokens: [
      {
        address: '0x9c3c9283d3e44854697cd22d3faa240cfb032889',
        // pair w/ dai on https://legacy.quickswap.exchange/
        stablePair: '0xc0ec4271d306f0ea4a70298c0243ea59a58bfd7f',
      },
    ],
  },
  420420: {
    chainId: 420420,
    name: 'KeKchain',
    shortName: 'KekChain',
    urlName: 'kekchain',
    nativeCurrency: {
      address: '0x54Bd9D8d758AC3717B37b7DC726877a23afF1B89',
      name: 'KeK',
      symbol: 'KEK',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://mainnet-explorer.kekchain.com/',
    rpcURL: 'https://mainnet.kekchain.com',
    icon: '/kekchain.png',
    isTestNet: false,
    supportedLiquidityPairTokens: [
      // Kek
      {
        address: '0x54Bd9D8d758AC3717B37b7DC726877a23afF1B89',
        // pair w/  on
        stablePair: '',
      },
    ],
  },
  420666: {
    chainId: 420666,
    name: 'KeKchain Testnet (testnet)',
    shortName: 'KeKchain',
    urlName: 'kektest',
    nativeCurrency: {
      address: '0xA888a7A2dc73efdb5705106a216f068e939A2693',
      name: 'KeK',
      symbol: 'KEK',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://testnet-explorer.kekchain.com/',
    rpcURL: 'https://testnet.kekchain.com',
    icon: '/kekchain.png',
    isTestNet: true,
    supportedLiquidityPairTokens: [
      // Kek
      {
        address: '0xA888a7A2dc73efdb5705106a216f068e939A2693',
        // pair w/  on
        stablePair: '',
      },
    ],
  },
  20202021 : {
    chainId: 20202021,
    name: 'Poochain',
    shortName: 'Poop',
    urlName: 'poochain',
    nativeCurrency: {
      address: '0x28e8E40abD4C51817a2Fae589257fA48F115Bc36',
      name: 'Poochain',
      symbol: 'POOP',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://www.pooscan.co/',
    rpcURL: 'https://mainnet.poochain.co/rpc',
    icon: '/poochain.png',
    isTestNet: false,
    supportedLiquidityPairTokens: [
      // POOP
      {
        address: '0x28e8E40abD4C51817a2Fae589257fA48F115Bc36',
        // pair w/ 0 on https://pooswap.finance/swap
        stablePair: '0',
      },
    ],
  },
}

export default function getNetworkDataByChainId(chainId: number): NetworkData | undefined {
  return networks[chainId]
}
