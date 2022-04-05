import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { BigNumber, Contract } from 'ethers'
import { useContractCache } from './ContractCache'
import { usePromise } from 'react-use'

export interface IFeesContractContext {
  contract?: Contract
  address?: string
  owner?: string

  getFeeAmountForType?: (feeType: string) => Promise<BigNumber>
}

export const FeesContractContext = createContext<IFeesContractContext>({
  //
})

export const useFeesContract = () => {
  const context = useContext(FeesContractContext)
  if (!context) throw new Error('useFeesContract can only be used within FeesContractContextProvider')
  return context
}

const FeesContractContextProvider: React.FC = ({ children }) => {
  const mounted = usePromise()
  const { getContract } = useContractCache()
  const [contract, setContract] = useState<Contract>()
  const [owner, setOwner] = useState<string>()

  const getFeeAmountForType: (feeType: string) => Promise<BigNumber> = useCallback(
    async (feeType: string) => {
      return (await contract?.getFeeAmountForType(feeType)) || BigNumber.from(0)
    },
    [contract],
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
              getFeeAmountForType,
            }
      }
    >
      {children}
    </FeesContractContext.Provider>
  )
}

export default FeesContractContextProvider
