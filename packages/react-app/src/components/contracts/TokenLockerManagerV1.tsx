import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { BigNumber, Contract } from 'ethers'
import { ContractCacheContext } from './ContractCache'
import { LPLockData, TokenLockData } from '../../typings'

export interface ITokenLockerManagerV1ContractContext {
  //
  contract?: Contract
  address?: string
  tokenLockerCount: number

  createTokenLocker?: (tokenAddress: string, amount: BigNumber, unlockTime: number) => Promise<number>
  getTokenLockersForAddress?: (address: string) => Promise<Array<number>>
  getTokenLockData?: (id: number) => Promise<TokenLockData>
  getLpData?: (id: number) => Promise<LPLockData>
}

export const TokenLockerManagerV1ContractContext = createContext<ITokenLockerManagerV1ContractContext>({
  //
  tokenLockerCount: 0,
})

const TokenLockerManagerV1ContractContextProvider: React.FC = ({ children }) => {
  const { getContract } = useContext(ContractCacheContext)
  const [contract, setContract] = useState<Contract>()
  const [tokenLockerCount, setTokenLockerCount] = useState<number>(0)

  const createTokenLocker = useCallback(
    async (tokenAddress: string, amount: BigNumber, unlockTime: number) => {
      //
      if (!contract) {
        throw new Error('Token locker contract is not loaded')
      }

      const tx = await contract.createTokenLocker(tokenAddress, amount, unlockTime)

      const result = await tx.wait()

      const lockerCreatedEvent = result.events.find((e: any) => e.event === 'TokenLockerCreated')

      return lockerCreatedEvent?.args?.id || 0
    },
    [contract],
  )

  const getTokenLockersForAddress = useCallback(
    async (address: string) => {
      //
      if (!contract) {
        throw new Error('Token locker contract is not loaded')
      }

      return await contract.getTokenLockersForAddress(address)
    },
    [contract],
  )

  const getTokenLockData = useCallback(
    async (id: number) => {
      if (!contract) {
        throw new Error('Token locker contract is not loaded')
      }

      return contract.getTokenLockData(id)
    },
    [contract],
  )

  const getLpData = useCallback(
    async (id: number) => {
      if (!contract) {
        throw new Error('Token locker contract is not loaded')
      }

      //
      return await contract.getLpData(id)
    },
    [contract],
  )

  useEffect(() => {
    getContract('TokenLockerManagerV1')
      .then(setContract)
      .catch((err: Error) => {
        console.error(err)
        setContract(undefined)
      })
  }, [getContract])

  useEffect(() => {
    if (!contract) {
      setTokenLockerCount(0)
      return
    }

    contract
      .tokenLockerCount()
      .then((_tokenLockerCount: number) => {
        //
        setTokenLockerCount(_tokenLockerCount)
      })
      .catch((err: Error) => {
        console.error(err)
        setTokenLockerCount(0)
      })
  }, [contract])

  return (
    <TokenLockerManagerV1ContractContext.Provider
      value={{
        //
        contract,
        address: contract?.address,
        tokenLockerCount,
        createTokenLocker,
        getTokenLockersForAddress,
        getTokenLockData,
        getLpData,
      }}
    >
      {children}
    </TokenLockerManagerV1ContractContext.Provider>
  )
}

export default TokenLockerManagerV1ContractContextProvider
