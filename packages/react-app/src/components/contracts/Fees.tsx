import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { BigNumber, Contract } from 'ethers'
import { useContractCache } from './ContractCache'
import { usePromise } from 'react-use'
import { useWeb3React } from '@web3-react/core'

export interface IFeesContractContext {
  contract?: Contract
  address?: string
  owner?: string

  getAdjustedFeeAmountForType?: (feeType: string) => Promise<BigNumber>
}

export const FeesContractContext = createContext<IFeesContractContext>({
  //
})

export const useFeesContract = () => {
  const context = useContext(FeesContractContext)
  if (!context) throw new Error('useFeesContract can only be used within FeesContractContextProvider')
  return context
}

export interface FeesContractContextProviderProps {
  children?: React.ReactNode
}

const FeesContractContextProvider: React.FC<FeesContractContextProviderProps> = ({ children }) => {
  const mounted = usePromise()
  const { getContract } = useContractCache()
  const [contract, setContract] = useState<Contract>()
  const [owner, setOwner] = useState<string>()
  const { account } = useWeb3React()

  const getAdjustedFeeAmountForType: (feeType: string) => Promise<BigNumber> = useCallback(
    async (feeType: string) => {
      return (await contract?.getAdjustedFeeAmountForType(account, feeType)) || BigNumber.from(0)
    },
    [account, contract],
  )

  useEffect(() => {
    mounted(getContract('Fees'))
      .then(setContract)
      .catch((err: Error) => {
        setContract(undefined)
      })
  }, [mounted, getContract])

  useEffect(() => {
    if (!contract) {
      setOwner(undefined)
      return
    }

    mounted<string>(contract.owner())
      .then((_owner: string) => {
        setOwner(_owner)
      })
      .catch((err: Error) => {
        console.error(err)
        setOwner(undefined)
      })
  }, [mounted, contract])

  return (
    <FeesContractContext.Provider
      value={
        !contract
          ? {}
          : {
              contract,
              address: contract.address,
              owner,
              getAdjustedFeeAmountForType,
            }
      }
    >
      {children}
    </FeesContractContext.Provider>
  )
}

export default FeesContractContextProvider
