import React, { createContext, useCallback, useEffect, useRef } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Contract } from 'ethers'
import { Web3Provider } from '@ethersproject/providers'
import { NetworkConnector } from '@web3-react/network-connector'
import _contracts from '../../contracts/production_contracts.json'

const getContractData = (chainId: number, name: string) => {
  const chains = (_contracts as any)[chainId.toString()]
  const key = Object.keys(chains)[0]
  return chains[key]?.contracts[name]
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

const ContractCacheContextProvider: React.FC = ({ children }) => {
  const { chainId, connector } = useWeb3React()
  const contracts = useRef<Record<number, Record<string, Contract>>>({})
  // const previousChainId = useRef<number>()

  // clear the cached contracts on network change
  useEffect(() => {
    // if () {
    contracts.current = {}
    // }
  }, [connector, chainId])

  const getContract = useCallback(
    async (name: string, { address, useSigner = true }: GetContractOptions = {}) => {
      if (!chainId || !connector) return undefined

      const contractData = getContractData(chainId, name)
      if (!contractData) return undefined
      const { address: defaultAddress, abi } = contractData
      const addressToUse: string = address || defaultAddress

      if (!contracts.current[chainId]) {
        contracts.current[chainId] = {}
      }

      // create the contract, only if it isn't already cached
      if (!contracts.current[chainId].hasOwnProperty(addressToUse)) {
        const provider = new Web3Provider(await connector.getProvider())

        // why does this need to be here, if it's also above?
        if (!contracts.current[chainId]) {
          contracts.current[chainId] = {}
        }

        contracts.current[chainId][addressToUse] = new Contract(
          addressToUse,
          abi,
          useSigner && !(connector instanceof NetworkConnector) ? provider.getSigner() : provider,
        )
      }

      return contracts.current[chainId][addressToUse]
    },
    [chainId, connector],
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
