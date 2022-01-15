import React, { useContext, useState, useEffect, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Light as LightButton } from './Button'
import { getNetworkDataByChainId } from '../util'
import { NetworkData } from '../typings'
import { ModalControllerContext } from './ModalController'
import DetailsCard from './DetailsCard'
import contracts from '../contracts/production_contracts.json'

interface ErrorInterface {
  code: number
  message: string
}

const NetworkSelect: React.FC = () => {
  const { setCurrentModal, closeModal } = useContext(ModalControllerContext)
  const { chainId, connector } = useWeb3React()
  const [networkData, setNetworkData] = useState<NetworkData>()
  const [provider, setProvider] = useState<any>()

  useEffect(() => {
    if (!connector) {
      setProvider(undefined)
      return
    }

    connector
      .getProvider()
      .then(setProvider)
      .catch(console.error)
  }, [connector])

  useEffect(() => {
    if (!chainId) {
      setNetworkData(undefined)
      return
    }

    setNetworkData(getNetworkDataByChainId(chainId))
  }, [chainId])

  const switchNetwork = useCallback(
    async (targetChainId: number) => {
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${targetChainId.toString(16)}` }],
        })
      } catch (error) {
        if ((error as ErrorInterface).code === 4902) {
          try {
            const targetNetworkData = getNetworkDataByChainId(targetChainId)

            if (!targetNetworkData) {
              //
              return
            }

            await provider.request({
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
            })
          } catch (error) {
            console.error(error)
          }
        }
      }

      closeModal()
    },
    [provider, closeModal],
  )

  return !chainId ? (
    <></>
  ) : (
    <>
      <LightButton
        className="flex gap-2 items-center"
        onClick={() => {
          //
          setCurrentModal(
            <DetailsCard
              headerContent={<div className="text-xl">Select network</div>}
              mainContent={
                <div>
                  {Object.keys(contracts).map((key, value, index) => {
                    const _networkData = getNetworkDataByChainId(parseInt(key))

                    return !_networkData ? (
                      <></>
                    ) : (
                      <div
                        key={key}
                        className="flex gap-3 items-center p-4 cursor-pointer hover:bg-gray-500 hover:bg-opacity-10"
                        onClick={() => {
                          //
                          switchNetwork(_networkData.chainId)
                        }}
                      >
                        {_networkData.icon && (
                          <img
                            alt={_networkData.name}
                            width={28}
                            height={28}
                            src={`/network-icons${_networkData.icon}`}
                          />
                        )}
                        <span>{_networkData.name}</span>
                      </div>
                    )
                  })}
                </div>
              }
            />,
          )
        }}
      >
        {networkData?.icon && (
          <img alt={networkData?.name || ''} width={20} height={20} src={`/network-icons${networkData.icon}`} />
        )}
        <span>{networkData?.shortName || 'Unknown'}</span>
      </LightButton>
    </>
  )
}

export default NetworkSelect
