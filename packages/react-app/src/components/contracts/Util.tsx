import React, { createContext, useContext, useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { TokenData, LPLockData } from '../../typings'
import contracts from '../../contracts/production_contracts.json'

import { Contract, providers } from 'ethers'
const { Web3Provider } = providers

export class UtilContract extends Contract {
  //
}

export interface IUtilContractContext {
  contract?: UtilContract
  getTokenData?: (address: string) => Promise<TokenData | undefined>
  isLpToken?: (address: string) => Promise<boolean>
  getLpData?: (address: string) => Promise<LPLockData | undefined>
}

export const UtilContractContext = createContext<IUtilContractContext>({
  //
})

const UtilContractContextProvider: React.FC = ({ children }) => {
  const w3 = useWeb3React()
  const [contract, setContract] = useState<UtilContract>()

  useEffect(() => {
    if (!w3.connector || !w3.chainId) {
      setContract(undefined)
      return
    }

    //
    const chains = (contracts as any)[w3.chainId.toString()]
    const key = Object.keys(chains)[0]
    const _contract = chains[key].contracts['Util']

    w3.connector
      .getProvider()
      .then(provider =>
        setContract(new UtilContract(_contract.address, _contract.abi, new Web3Provider(provider).getSigner())),
      )
      .catch(console.error)
  }, [w3])

  return (
    <UtilContractContext.Provider
      value={{
        contract,
        getTokenData: async (address: string) => {
          if (!contract) throw new Error('Contract is not ready')

          return {
            address,
            ...(await contract.getTokenData(address)),
          }
        },
        isLpToken: async (address: string) => {
          if (!contract) throw new Error('Contract is not ready')

          return await contract.isLpToken(address)
        },
        getLpData: async (address: string) => {
          if (!contract) throw new Error('Contract is not ready')

          return await contract.getLpData(address)
        },
      }}
    >
      {children}
    </UtilContractContext.Provider>
  )
}

export default UtilContractContextProvider
