import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useUtilContract } from './Util'
import { BigNumber, utils, providers } from 'ethers'
import { LPData, NetworkData } from '../../typings'
import { getNetworkDataByChainId } from '../../util'
import { useWeb3React, getWeb3ReactContext } from '@web3-react/core'
import { usePromise } from 'react-use'
import { Web3Provider as Web3ProviderClass } from '@ethersproject/providers'

const { Web3Provider } = providers

export interface IPriceTrackerContext {
  readonly networkData?: NetworkData
  readonly nativeCoinPrice?: number

  /** assumes the pair has already been checked with `isSupportedPair` */
  getPriceForPair: (lpData: LPData, attempts?: number) => Promise<number>
  isSupportedPair: (lpData: LPData) => boolean
  isSupportedToken: (token: string) => boolean
  /** assumes the pair has already been checked with `isSupportedPair` */
  getTokenFromPair: (lpData: LPData) => string | undefined
  getStablePairAddress: (lpData: LPData) => string | undefined
}

export const PriceTrackerContext = createContext<IPriceTrackerContext>({
  getPriceForPair: async () => 0,
  isSupportedPair: () => false,
  isSupportedToken: () => false,
  getTokenFromPair: () => undefined,
  getStablePairAddress: () => undefined,
})

export const usePriceTracker = () => {
  const context = useContext(PriceTrackerContext)
  if (!context) throw new Error('usePriceTracker can only be used within PriceTrackerContextProvider')
  return context
}

interface PriceCache {
  price: number
  timestamp: number
}

let PRICE_CACHE: Record<string, PriceCache> = {}

const PriceTrackerContextProvider: React.FC = ({ children }) => {
  const mounted = usePromise()
  const { chainId: chainIdConstant, connector: connectorConstant } = useContext(getWeb3ReactContext('constant'))
  const { chainId, connector } = useWeb3React()
  const [provider, setProvider] = useState<Web3ProviderClass>()
  const { getLpData, getTokenData } = useUtilContract()
  const [networkData, setNetworkData] = useState<NetworkData>()
  const [nativeStablePair, setNativeStablePair] = useState<string>()
  const [nativeCoinPrice, setNativeCoinPrice] = useState<number>()
  const lastNativeCoinPriceUpdate = useRef<number>(0)
  const retryTimerRef = useRef<NodeJS.Timeout>()

  const eitherChainId = typeof chainId !== 'undefined' ? chainId : chainIdConstant
  const eitherConnector = typeof connector !== 'undefined' ? connector : connectorConstant

  const isSupportedToken = useCallback(
    (token: string) => {
      return networkData ? networkData.supportedLiquidityPairTokens.some(({ address }) => address === token) : false
    },
    [networkData],
  )

  const isSupportedPair = useCallback(
    (lpData: LPData) => {
      return networkData
        ? networkData.supportedLiquidityPairTokens.some(
            ({ address }) => address === lpData.token0 || address === lpData.token1,
          )
        : false
    },
    [networkData],
  )

  const getTokenFromPair = useCallback(
    (lpData: LPData) => {
      return networkData?.supportedLiquidityPairTokens.some(({ address }) => address === lpData.token1)
        ? lpData.token0
        : lpData.token1
    },
    [networkData],
  )

  const getStablePairAddress = useCallback(
    (lpData: LPData) => {
      const token = getTokenFromPair(lpData)
      const pairedToken = token === lpData.token0 ? lpData.token1 : lpData.token0

      const { stablePair } =
        networkData?.supportedLiquidityPairTokens.find(({ address }) => address === pairedToken) || {}

      return stablePair
    },
    [getTokenFromPair, networkData],
  )

  const getPriceForPair = useCallback(
    async (lpData: LPData, attempts: number = 5, attemptNum: number = 1): Promise<number> => {
      if (!getTokenData || attemptNum > attempts) {
        return 0
      }

      const token = getTokenFromPair(lpData)
      const tokenBalance = token === lpData.token0 ? lpData.balance0 : lpData.balance1
      const pairedToken = token === lpData.token0 ? lpData.token1 : lpData.token0
      const pairedTokenBalance = token === lpData.token0 ? lpData.balance1 : lpData.balance0

      if (PRICE_CACHE[pairedToken] && Date.now() - PRICE_CACHE[pairedToken].timestamp < 10000) {
        if (!PRICE_CACHE[pairedToken].price) {
          await new Promise((done) => {
            retryTimerRef.current && clearTimeout(retryTimerRef.current)
            retryTimerRef.current = setTimeout(done, 1000)
          })

          return await mounted(getPriceForPair(lpData, attempts, attemptNum++))
        }

        return PRICE_CACHE[pairedToken].price
      }

      PRICE_CACHE[pairedToken] = {
        price: 0,
        timestamp: Date.now(),
      }

      const [tokenData, pairedTokenData] = await mounted(Promise.all([getTokenData(token), getTokenData(pairedToken)]))

      if (!tokenData || !pairedTokenData) {
        delete PRICE_CACHE[pairedToken]
        return 0
      }

      PRICE_CACHE[pairedToken].price = parseFloat(
        utils.formatUnits(
          tokenBalance.mul(BigNumber.from(10).pow(pairedTokenData.decimals)).div(pairedTokenBalance),
          tokenData.decimals,
        ),
      )

      // don't cache when the price is 0
      if (PRICE_CACHE[pairedToken].price <= 0) {
        delete PRICE_CACHE[pairedToken]
        return 0
      }

      return PRICE_CACHE[pairedToken].price
    },
    [mounted, getTokenData, getTokenFromPair],
  )

  // wipe the price cache on network change
  useEffect(() => {
    PRICE_CACHE = {}
    retryTimerRef.current && clearTimeout(retryTimerRef.current)
  }, [eitherChainId])

  useEffect(() => {
    //
    if (!eitherChainId) {
      setNetworkData(undefined)
      return
    }

    setNetworkData(getNetworkDataByChainId(eitherChainId))

    return () => {
      setNetworkData(undefined)
    }
  }, [eitherChainId])

  useEffect(() => {
    if (!getLpData || !networkData) {
      setNativeStablePair(undefined)
      return
    }

    const { stablePair } =
      networkData.supportedLiquidityPairTokens.find((_pair) => _pair.address === networkData.nativeCurrency.address) ||
      {}

    setNativeStablePair(stablePair)
  }, [getLpData, networkData])

  const updateNativeCoinPrice = useCallback(() => {
    if (!nativeStablePair || !getLpData || !getPriceForPair) {
      setNativeCoinPrice(0)
      return
    }

    mounted(getLpData(nativeStablePair))
      .then((result) => {
        if (!result) return Promise.reject(new Error('Failed to get stable pair LP data'))

        return mounted(getPriceForPair(result))
      })
      .then(setNativeCoinPrice)
      .catch((err) => {
        // console.error(err)
        setNativeCoinPrice(0)
      })
  }, [mounted, nativeStablePair, getLpData, getPriceForPair])

  useEffect(updateNativeCoinPrice, [updateNativeCoinPrice])

  useEffect(() => {
    if (!eitherChainId || !eitherConnector) {
      setProvider(undefined)
      return
    }

    mounted<any>(eitherConnector.getProvider())
      .then((_provider) => new Web3Provider(_provider, 'any'))
      .then(setProvider)
      .catch((err: Error) => {
        console.error(err)
      })
  }, [mounted, eitherChainId, eitherConnector])

  useEffect(() => {
    if (!provider) return

    const onBlock = () => {
      if (Date.now() - lastNativeCoinPriceUpdate.current < 1000) return

      lastNativeCoinPriceUpdate.current = Date.now()

      updateNativeCoinPrice()
    }

    const _provider = provider

    _provider.on('block', onBlock)

    return () => {
      _provider?.off('block', onBlock)
    }
  }, [provider, updateNativeCoinPrice])

  return (
    <PriceTrackerContext.Provider
      value={{
        nativeCoinPrice,

        networkData,

        getPriceForPair,

        isSupportedToken,
        isSupportedPair,

        getTokenFromPair,
        getStablePairAddress,
      }}
    >
      {children}
    </PriceTrackerContext.Provider>
  )
}

export default PriceTrackerContextProvider
