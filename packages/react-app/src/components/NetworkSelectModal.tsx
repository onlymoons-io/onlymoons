import React, { useContext, useEffect, useState } from 'react'
import DetailsCard from './DetailsCard'
import { networks } from '../util/getNetworkDataByChainId'
import { NetworkData } from '../typings'
import { getWeb3ReactContext } from '@web3-react/core'
import { getNetworkDataByChainId } from '../util'
import { ModalControllerContext } from './ModalController'
import StyledSwitch from './StyledSwitch'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWrench } from '@fortawesome/free-solid-svg-icons'
import { useNetworkSwitcherContext } from './NetworkSwitcher'

const allNetworkData: Array<NetworkData> = Object.keys(networks)
  .map((key) => getNetworkDataByChainId(parseInt(key)) as NetworkData)
  // sort network data array by name
  .sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0))

const NetworkSelectModal: React.FC = () => {
  const { chainId } = useContext(getWeb3ReactContext('constant'))
  const { closeModal } = useContext(ModalControllerContext)
  const { switchNetwork } = useNetworkSwitcherContext()
  const [showTestNets, setShowTestNets] = useState<boolean>(false)

  useEffect(() => {
    setShowTestNets(!chainId ? false : networks[chainId]?.isTestNet ?? false)
  }, [chainId])

  return (
    <DetailsCard
      className="w-full max-w-sm"
      style={{ height: '66.666vh' }}
      headerContent={
        <div className="flex items-center justify-between">
          <div className="text-xl">Select network</div>
          <div className="flex gap-2 items-center">
            <StyledSwitch
              label={
                <>
                  <FontAwesomeIcon icon={faWrench} opacity={0.25} />
                </>
              }
              defaultChecked={!chainId ? false : networks[chainId]?.isTestNet ?? false}
              onCheckedChange={setShowTestNets}
            />
          </div>
        </div>
      }
      mainContent={
        <div>
          {/** @todo sort this alphabetically by network name */}
          {allNetworkData
            .filter((_networkData) => !_networkData.isTestNet || showTestNets)
            .map((_networkData) => {
              return !_networkData ? (
                <></>
              ) : (
                <div
                  key={_networkData.chainId}
                  className="flex gap-3 items-center justify-between p-4 cursor-pointer hover:bg-gray-500 hover:bg-opacity-10"
                  onClick={() => {
                    switchNetwork(_networkData.chainId)
                    closeModal()
                  }}
                >
                  <div className="flex gap-3 items-center">
                    {_networkData.icon && (
                      <img alt={''} width={28} height={28} src={`./network-icons${_networkData.icon}`} />
                    )}
                    <span>{_networkData.name}</span>
                  </div>

                  {_networkData.isTestNet && <FontAwesomeIcon icon={faWrench} opacity={0.25} />}
                </div>
              )
            })}
        </div>
      }
    />
  )
}

export default NetworkSelectModal
