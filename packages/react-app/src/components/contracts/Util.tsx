import React, { createContext, useContext, useState, useEffect } from 'react'
import { Contract } from 'ethers'
import { useContractCache } from './ContractCache'
import { TokenData, LPData } from '../../typings'
import { usePromise } from 'react-use'
import { useCallback } from 'react'

export class UtilContract extends Contract {
  //
}

export interface IUtilContractContext {
  contract?: UtilContract
  getTokenData?: (address: string) => Promise<TokenData | undefined>
  isLpToken?: (address: string) => Promise<boolean>
  getLpData?: <T = LPData>(address: string) => Promise<T | undefined>
}

export const UtilContractContext = createContext<IUtilContractContext>({
  //
})

export const useUtilContract = () => {
  const context = useContext(UtilContractContext)
  if (!context) throw new Error('useUtilContract can only be used within UtilContractContextProvider')
  return context
}

const UtilContractContextProvider: React.FC = ({ children }) => {
  const mounted = usePromise()
  const { getContract } = useContractCache()
  const [contract, setContract] = useState<UtilContract>()

  useEffect(() => {
    mounted(getContract('Util'))
      .then(setContract)
      .catch((err: Error) => {
        console.error(err)
        setContract(undefined)
      })
  }, [mounted, getContract])

  const getTokenData = useCallback(
    async (address: string) => {
      if (!contract) throw new Error('Contract is not ready')

      return {
        address,
        ...(await mounted<Omit<TokenData, 'address'>>(contract.getTokenData(address))),
      }
    },
    [mounted, contract],
  )

  return (
    <UtilContractContext.Provider
      value={
        !contract
          ? {}
          : {
              contract,
              getTokenData,
              isLpToken: async (address: string) => {
                if (!contract) throw new Error('Contract is not ready')

                return await contract.isLpToken(address)
              },
              getLpData: async (address: string) => {
                if (!contract) throw new Error('Contract is not ready')

                return await contract.getLpData(address)
              },
            }
      }
    >
      {children}
    </UtilContractContext.Provider>
  )
}

export default UtilContractContextProvider
