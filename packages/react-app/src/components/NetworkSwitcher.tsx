import React, { createContext, useContext } from 'react'
import { usePromise } from 'react-use'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import { getNetworkDataByChainId } from '../util'
import { useModal } from './ModalController'

interface ErrorInterface {
  code: number
  message: string
}

export interface INetworkSwitcherContext {
  switchNetwork: (_connector: AbstractConnector, _provider: any, targetChainId: number) => Promise<void>
}

export const NetworkSwitcherContext = createContext<INetworkSwitcherContext>({
  switchNetwork: async () => {},
})

export const useNetworkSwitcherContext = () => {
  return useContext(NetworkSwitcherContext)
}

const NetworkSwitcherContextProvider: React.FC = ({ children }) => {
  const mounted = usePromise()
  const { closeModal } = useModal()

  const switchNetwork = async (_connector: AbstractConnector, _provider: any, targetChainId: number) => {
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
  }

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
