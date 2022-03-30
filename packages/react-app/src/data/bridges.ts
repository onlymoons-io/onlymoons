import { BridgeData } from '../typings'

const bridges: Record<number, BridgeData> = {
  4: {
    bridge: '0x7BF2f06D65b5C9f146ea79a4eCC7C7cdFC01B613',
    erc20Handler: '0x016c1D8cf86f60A5382BA5c42D4be960CBd1b868',
    destinations: [
      {
        chainId: 97,
        resources: {
          // onlymoons token
          '0x9B4A2E36d59e8b5E75d9f033b962E226fE617464':
            '0x000000000000000000000061eccf50a459b11f2609bcec009481f4dcbb824761',
        },
      },
      {
        chainId: 123,
        resources: {
          // onlymoons token
          '0x9B4A2E36d59e8b5E75d9f033b962E226fE617464':
            '0x000000000000000000000061eccf50a459b11f2609bcec009481f4dcbb824761',
        },
      },
    ],
  },
  97: {
    bridge: '0xc5C3A145307548e71e3320360B92eFE5a732844a',
    erc20Handler: '0x77A5c78977EDf1eB48b040a0f454201bbB21FA39',
    destinations: [
      {
        chainId: 4,
        resources: {
          // // empty test token
          // '0x43dDD4A4Bf0Ff1727c0E4255af5bEBaFc1513663':
          //   '0x000000000000000000000084a6ee8D28e322DD40B1988F06e2c58E943fE0a961',

          // onlymoons token
          '0x61eCcF50a459B11f2609BceC009481F4Dcbb8247':
            '0x000000000000000000000061eccf50a459b11f2609bcec009481f4dcbb824761',
        },
      },
      {
        chainId: 123,
        resources: {
          // onlymoons token
          '0x61eCcF50a459B11f2609BceC009481F4Dcbb8247':
            '0x000000000000000000000061eccf50a459b11f2609bcec009481f4dcbb824761',
        },
      },
      // {
      //   chainId: 588,
      //   resources: {
      //     // onlymoons token
      //     // '0x61eCcF50a459B11f2609BceC009481F4Dcbb8247':
      //     //   '0x000000000000000000000061eCcF50a459B11f2609BceC009481F4Dcbb824761',
      //   },
      // },
    ],
  },
  123: {
    bridge: '0x016c1D8cf86f60A5382BA5c42D4be960CBd1b868',
    erc20Handler: '0xA70765C0428d1f9BE926e2C64b93823aa1646Efe',
    destinations: [
      {
        chainId: 4,
        resources: {
          // onlymoons tokens
          '0xF7B1f90024B10aF90B9e30D992193cFA7E1aC87C':
            '0x000000000000000000000061eccf50a459b11f2609bcec009481f4dcbb824761',
        },
      },
      {
        chainId: 97,
        resources: {
          // onlymoons token
          '0xF7B1f90024B10aF90B9e30D992193cFA7E1aC87C':
            '0x000000000000000000000061eccf50a459b11f2609bcec009481f4dcbb824761',
        },
      },
    ],
  },
}

export default bridges
