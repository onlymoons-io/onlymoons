import React, { createContext, useEffect, useRef } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Contract } from 'ethers'
import { Web3Provider } from '@ethersproject/providers'
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
  const contracts = useRef<Record<string, Contract>>({})
  const previousChainId = useRef<number>()

  // clear the cached contracts on network change
  useEffect(() => {
    if (chainId !== previousChainId.current) {
      contracts.current = {}
      previousChainId.current = chainId
    }
  }, [chainId])

  return (
    <ContractCacheContext.Provider
      value={{
        getContract: async (name: string, { address, useSigner = true }: GetContractOptions = {}) => {
          if (!chainId || !connector) return undefined

          const contractData = getContractData(chainId, name)
          if (!contractData) return undefined
          const { address: defaultAddress, abi } = contractData
          const addressToUse: string = address || defaultAddress

          // create the contract, only if it isn't already cached
          if (!contracts.current.hasOwnProperty(addressToUse)) {
            const provider = new Web3Provider(await connector.getProvider())

            contracts.current[addressToUse] = new Contract(
              addressToUse,
              abi,
              useSigner ? provider.getSigner() : provider,
            )
          }

          return contracts.current[addressToUse]
        },
      }}
    >
      {children}
    </ContractCacheContext.Provider>
  )
}

export default ContractCacheContextProvider
