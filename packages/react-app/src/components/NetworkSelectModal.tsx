import React, { useCallback, useContext, useEffect, useState } from 'react'
import DetailsCard from './DetailsCard'
import { networks } from '../util/getNetworkDataByChainId'
import { NetworkData } from '../typings'
import { useWeb3React, getWeb3ReactContext } from '@web3-react/core'
import { getNetworkDataByChainId } from '../util'
import { usePromise } from 'react-use'
import { ModalControllerContext } from './ModalController'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import StyledSwitch from './StyledSwitch'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWrench } from '@fortawesome/free-solid-svg-icons'

interface ErrorInterface {
  code: number
  message: string
}

const allNetworkData: Array<NetworkData> = Object.keys(networks)
  .map((key) => getNetworkDataByChainId(parseInt(key)) as NetworkData)
  // sort network data array by name
  .sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0))

const NetworkSelectModal: React.FC = () => {
  const mounted = usePromise()
  const { connector: connectedConnector } = useWeb3React()
  const { chainId, connector } = useContext(getWeb3ReactContext('constant'))
  const { closeModal } = useContext(ModalControllerContext)
  const [provider, setProvider] = useState<any>()
  const [connectedProvider, setConnectedProvider] = useState<any>()
  const [showTestNets, setShowTestNets] = useState<boolean>(false)

  useEffect(() => {
    setShowTestNets(!chainId ? false : networks[chainId]?.isTestNet ?? false)
  }, [chainId])

  useEffect(() => {
    if (!connector) {
      setProvider(undefined)
      return
    }

    mounted(connector.getProvider())
      .then(setProvider)
      .catch((err) => {
        console.error(err)
        setProvider(undefined)
      })
  }, [mounted, connector])

  useEffect(() => {
    if (!connectedConnector) {
      setConnectedProvider(undefined)
      return
    }

    mounted(connectedConnector.getProvider())
      .then(setConnectedProvider)
      .catch((err) => {
        console.error(err)
        setConnectedProvider(undefined)
      })
  }, [mounted, connectedConnector])

  const switchNetwork = useCallback(
    async (_connector: AbstractConnector, _provider: any, targetChainId: number) => {
      try {
        if (_connector instanceof NetworkConnector) {
          _connector.changeChainId(targetChainId)
        } else {
          await mounted(
            _provider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${targetChainId.toString(16)}` }],
            }),
          )
        }
      } catch (error) {
        if ((error as ErrorInterface).code === 4902) {
          try {
            const targetNetworkData = getNetworkDataByChainId(targetChainId)

            if (!targetNetworkData) {
              //
              return
            }

            await mounted(
              _provider.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: `0x${targetChainId.toString(16)}`,
                    chainName: targetNetworkData.name,
                    rpcUrls: [targetNetworkData.rpcURL],
                    nativeCurrency: {
                      name: targetNetworkData.nativeCurrency.name,
                      symbol: targetNetworkData.nativeCurrency.symbol,
                      decimals: targetNetworkData.nativeCurrency.decimals,
                    },
                    blockExplorerUrls: [targetNetworkData.explorerURL],
                  },
                ],
              }),
            )
          } catch (error) {
            console.error(error)
          }
        }
      }

      closeModal()
    },
    [mounted, closeModal],
  )

  return (
    <DetailsCard
      className="w-full"
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
                    if (connectedConnector && connectedProvider) {
                      switchNetwork(connectedConnector, connectedProvider, _networkData.chainId)
                    } else if (connector && provider) {
                      switchNetwork(connector, provider, _networkData.chainId)
                    }
                  }}
                >
                  <div className="flex gap-3 items-center">
                    {_networkData.icon && (
                      <img alt={_networkData.name} width={28} height={28} src={`/network-icons${_networkData.icon}`} />
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
