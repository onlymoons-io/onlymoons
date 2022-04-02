import React, { useContext, useEffect, useState } from 'react'
import tw from 'tailwind-styled-components'
import { BigNumber, utils } from 'ethers'
import { useUtilContract } from './contracts/Util'
import { usePriceTracker } from './contracts/PriceTracker'
import { useWeb3React, getWeb3ReactContext } from '@web3-react/core'
import { getNetworkDataByChainId, getFormattedAmount } from '../util'
import { LPData, NetworkData, TokenData } from '../typings'
import humanNumber from 'human-number'
import { usePromise } from 'react-use'

const { formatUnits } = utils

const Outer = tw.div`
  flex
  justify-start
  items-center
  gap-1
`

const Amount = tw.div`

`

const Value = tw.div`

`

const ValueInner = tw.span`
  
`

export interface TokenWithValueProps {
  amount: BigNumber
  tokenData: TokenData
  showSymbol?: boolean
  showAmount?: boolean
  showValue?: boolean
}

const TokenWithValue: React.FC<TokenWithValueProps> = ({
  amount,
  tokenData,
  showSymbol = true,
  showAmount = true,
  showValue = true,
}) => {
  const mounted = usePromise()
  const { chainId } = useWeb3React()
  const { chainId: chainIdConstant } = useContext(getWeb3ReactContext('constant'))
  const { getLpData } = useUtilContract()
  const { isSupportedToken, getPriceForPair } = usePriceTracker()
  const [networkData, setNetworkData] = useState<NetworkData>()
  const [lpData, setLpData] = useState<LPData>()
  // const [pairedTokenData, setPairedTokenData] = useState<TokenData>()
  const [supported, setSupported] = useState<boolean>(false)
  const [price, setPrice] = useState<number>()

  const eitherChainId = typeof chainId !== 'undefined' ? chainId : chainIdConstant

  useEffect(() => {
    setNetworkData(eitherChainId ? getNetworkDataByChainId(eitherChainId) : undefined)
  }, [eitherChainId])

  useEffect(() => {
    setSupported(isSupportedToken && isSupportedToken(tokenData.address) ? true : false)
  }, [tokenData.address, isSupportedToken])

  useEffect(() => {
    if (!networkData || !getLpData || !tokenData.address || !supported) {
      setLpData(undefined)
      return
    }

    const supportedPair = networkData.supportedLiquidityPairTokens.find((pair) => pair.address === tokenData.address)

    if (!supportedPair) {
      setLpData(undefined)
      return
    }

    mounted(getLpData(supportedPair.stablePair))
      .then((lpData?: LPData) =>
        lpData ? Promise.resolve(lpData) : Promise.reject(new Error('Failed to get LP data')),
      )
      .then(setLpData)
      .catch((err: Error) => {
        console.error(err)
        setLpData(undefined)
      })

    // getPriceForPair(networkData.supportedLiquidityPairTokens.find())
  }, [mounted, tokenData.address, supported, networkData, getLpData])

  // useEffect(() => {
  //   if (!lpData || !getTokenData || !showValue) {
  //     setPairedTokenData(undefined)
  //     return
  //   }

  //   getTokenData(lpData.token0 === tokenData.address ? lpData.token1 : lpData.token0)
  //     .then(setPairedTokenData)
  //     .catch((err: Error) => {
  //       console.error(err)
  //       setPairedTokenData(undefined)
  //     })
  // }, [tokenData.address, lpData, getTokenData, showValue])

  useEffect(() => {
    if (!getPriceForPair || !lpData) {
      setPrice(0)
      return
    }

    mounted(getPriceForPair(lpData))
      .then(setPrice)
      .catch((err: Error) => {
        console.error(err)
        setPrice(0)
      })
  }, [mounted, lpData, getPriceForPair])

  return (
    <Outer>
      {showAmount ? (
        <>
          <Amount>
            {getFormattedAmount(amount, tokenData.decimals)} {showSymbol ? tokenData.symbol : <></>}
            {/* {humanNumber(parseFloat(formatUnits(amount, tokenData.decimals)), n =>
              n.toLocaleString(undefined, { maximumFractionDigits: tokenData.decimals }),
            )}{' '}
            {tokenData.symbol} */}
          </Amount>
        </>
      ) : (
        <></>
      )}

      {showValue && price ? (
        <>
          <Value>
            (
            <ValueInner>
              $
              {humanNumber(parseFloat(formatUnits(amount, tokenData.decimals)) * price, (n) =>
                n.toLocaleString(undefined, { maximumFractionDigits: 2 }),
              )}
            </ValueInner>
            )
          </Value>
        </>
      ) : (
        <></>
      )}
    </Outer>
  )
}

export default TokenWithValue
