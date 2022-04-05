import React, { createContext, useContext } from 'react'
import { usePromise } from 'react-use'
import { NetworkConnector } from '@web3-react/network-connector'
import { getNetworkDataByChainId } from '../util'
import { useCallback } from 'react'
import { getWeb3ReactContext, useWeb3React } from '@web3-react/core'

interface ErrorInterface {
  code: number
  message: string
}

export interface INetworkSwitcherContext {
  switchNetwork: (targetChainId: number) => Promise<void>
}

export const NetworkSwitcherContext = createContext<INetworkSwitcherContext>({
  switchNetwork: async () => {},
})

export const useNetworkSwitcherContext = () => {
  return useContext(NetworkSwitcherContext)
}

const NetworkSwitcherContextProvider: React.FC = ({ children }) => {
  const mounted = usePromise()
  const { connector: connectedConnector } = useWeb3React()
  const { connector: constantConnector } = useContext(getWeb3ReactContext('constant'))

  const eitherConnector = typeof connectedConnector !== 'undefined' ? connectedConnector : constantConnector

  const switchNetwork = useCallback(
    async (targetChainId: number) => {
      if (!eitherConnector) return

      try {
        if (eitherConnector instanceof NetworkConnector) {
          eitherConnector.changeChainId(targetChainId)
        } else {
          await mounted(
            (
              await eitherConnector.getProvider()
            ).request({
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
              (
                await eitherConnector.getProvider()
              ).request({
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
    },
    [mounted, eitherConnector],
  )

  return (
    <NetworkSwitcherContext.Provider
      value={{
        switchNetwork,
      }}
    >
      {children}
    </NetworkSwitcherContext.Provider>
  )
}

export default NetworkSwitcherContextProvider
