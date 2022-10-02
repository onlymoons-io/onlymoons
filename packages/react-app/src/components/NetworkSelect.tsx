import React, { useContext, useState, useEffect, CSSProperties } from 'react'
import { getWeb3ReactContext } from '@web3-react/core'
import { Light as LightButton } from './Button'
import { getNetworkDataByChainId } from '../util'
import { NetworkData } from '../typings'
import { useModal } from './ModalController'
import { usePriceTracker } from './contracts/PriceTracker'
import NetworkSelectModal from './NetworkSelectModal'

export interface NetworkSelectProps {
  className?: string
  style?: CSSProperties
}

const NetworkSelect: React.FC<NetworkSelectProps> = ({ className = '', style = {} }) => {
  const { nativeCoinPrice } = usePriceTracker()
  const { setCurrentModal } = useModal()
  const { chainId } = useContext(getWeb3ReactContext('constant'))
  const [networkData, setNetworkData] = useState<NetworkData>()

  useEffect(() => {
    if (!chainId) {
      setNetworkData(undefined)
      return
    }

    setNetworkData(getNetworkDataByChainId(chainId))
  }, [chainId])

  return !chainId ? (
    <></>
  ) : (
    <>
      <LightButton
        className={`flex gap-2 items-center ${networkData?.isTestNet ? 'border-2 border-yellow-500' : ''} ${className}`}
        style={style}
        onClick={() => setCurrentModal(<NetworkSelectModal />)}
      >
        {networkData?.icon && <img alt={''} width={20} height={20} src={`./network-icons${networkData.icon}`} />}
        {/* {networkData?.isTestNet && (
          <FontAwesomeIcon
            className="text-red-300 bg-gray-800 rounded-full p-1 transform-gpu scale-125"
            icon={faWrench}
          />
        )} */}
        <span className="hidden lg:inline font-bold">{networkData?.shortName}</span>
        <span className="hidden md:inline">{networkData?.nativeCurrency.symbol || '???'}</span>
        {nativeCoinPrice ? (
          <span className="ml-1 opacity-60">
            $
            {(nativeCoinPrice || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        ) : (
          <></>
        )}
      </LightButton>
    </>
  )
}

export default NetworkSelect
