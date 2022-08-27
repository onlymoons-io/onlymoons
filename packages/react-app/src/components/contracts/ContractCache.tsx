import React, { createContext, useCallback, useEffect, useState, useContext } from 'react'
import { useWeb3React, getWeb3ReactContext } from '@web3-react/core'
import { Contract } from 'ethers'
import { Web3Provider } from '@ethersproject/providers'
import { NetworkConnector } from '@web3-react/network-connector'
import _compiledContracts from '../../contracts/compiled_contracts.json'

const getContractData = (chainId: number, name: string) => {
  const compiledContracts = _compiledContracts as any
  const address =
    compiledContracts[name].networks[chainId.toString()][
      Object.keys(compiledContracts[name].networks[chainId.toString()])[0]
    ]
  if (!address) return undefined
  const abi = compiledContracts[name].abi
  return { address, abi }
}

export interface GetContractOptions {
  address?: string
  useSigner?: boolean
}

export interface IContractCacheContext {
  // getContract: async (name: string, { address, useSigner }: GetContractOptions)
  getContract: (name: string, options?: GetContractOptions) => Promise<Contract | undefined>
}

export const ContractCacheContext = createContext<IContractCacheContext>({
  getContract: () => Promise.resolve(undefined),
})

export const useContractCache = () => {
  const context = useContext(ContractCacheContext)
  if (!context) throw new Error('useContractCache can only be used within ContractCacheContextProvider')
  return context
}

const ContractCacheContextProvider: React.FC = ({ children }) => {
  const { chainId, connector } = useWeb3React()
  const { chainId: chainIdConstant, connector: connectorConstant } = useContext(getWeb3ReactContext('constant'))
  const [contracts, setContracts] = useState<Record<number, Record<string, Contract>>>({})
  // const previousChainId = useRef<number>()

  const eitherChainId = typeof chainId !== 'undefined' ? chainId : chainIdConstant
  const eitherConnector = typeof connector !== 'undefined' ? connector : connectorConstant

  // clear the cached contracts on network change
  useEffect(() => {
    // if () {
    // contracts.current = {}
    setContracts({})
    // }
  }, [eitherConnector, eitherChainId])

  const getContract = useCallback(
    async (name: string, { address, useSigner = true }: GetContractOptions = {}) => {
      if (!eitherChainId || !eitherConnector) return undefined

      const contractData = getContractData(eitherChainId, name)
      if (!contractData) return undefined
      const { address: defaultAddress, abi } = contractData
      const addressToUse: string = address || defaultAddress

      if (!contracts[eitherChainId]) {
        contracts[eitherChainId] = {}
      }

      // create the contract, only if it isn't already cached
      if (!contracts[eitherChainId].hasOwnProperty(addressToUse)) {
        const provider = new Web3Provider(await eitherConnector.getProvider(), 'any')

        // why does this need to be here, if it's also above?
        if (!contracts[eitherChainId]) {
          contracts[eitherChainId] = {}
        }

        contracts[eitherChainId][addressToUse] = new Contract(
          addressToUse,
          abi,
          useSigner && !(eitherConnector instanceof NetworkConnector) ? provider.getSigner() : provider,
        )
      }

      return contracts[eitherChainId][addressToUse]
    },
    [contracts, eitherChainId, eitherConnector],
  )

  return (
    <ContractCacheContext.Provider
      value={{
        getContract,
      }}
    >
      {children}
    </ContractCacheContext.Provider>
  )
}

export default ContractCacheContextProvider
