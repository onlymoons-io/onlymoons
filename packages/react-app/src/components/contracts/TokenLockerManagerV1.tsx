import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { BigNumber, Contract } from 'ethers'
import { useContractCache } from './ContractCache'
import { LPLockData, TokenLockData } from '../../typings'
import { usePromise } from 'react-use'
import { useWeb3React, getWeb3ReactContext } from '@web3-react/core'

export interface ITokenLockerManagerV1ContractContext {
  //
  contract?: Contract
  address?: string
  tokenLockerCount: number

  updateTokenLockerCount?: () => Promise<void>
  createTokenLocker?: (tokenAddress: string, amount: BigNumber, unlockTime: number) => Promise<number>
  getTokenLockersForAddress?: (address: string) => Promise<Array<number>>
  getTokenLockData?: (id: number) => Promise<TokenLockData>
  getLpData?: (id: number) => Promise<LPLockData>
}

export const TokenLockerManagerV1ContractContext = createContext<ITokenLockerManagerV1ContractContext>({
  //
  tokenLockerCount: 0,
})

export const useTokenLockerManagerV1Contract = () => {
  const context = useContext(TokenLockerManagerV1ContractContext)
  if (!context)
    throw new Error(
      'useTokenLockerManagerV1Contract can only be used within TokenLockerManagerV1ContractContextProvider',
    )
  return context
}

const TokenLockerManagerV1ContractContextProvider: React.FC = ({ children }) => {
  const mounted = usePromise()
  const { getContract } = useContractCache()
  const [contract, setContract] = useState<Contract>()
  const [tokenLockerCount, setTokenLockerCount] = useState<number>(0)
  const { chainId } = useWeb3React()
  const { chainId: chainIdConstant } = useContext(getWeb3ReactContext('constant'))

  const eitherChainId = typeof chainId !== 'undefined' ? chainId : chainIdConstant

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

  const updateTokenLockerCount = useCallback(async () => {
    if (!contract) {
      setTokenLockerCount(0)
      return
    }

    try {
      setTokenLockerCount(await mounted(contract.tokenLockerCount()))
    } catch (err) {
      console.error(err)
      setTokenLockerCount(0)
    }
  }, [mounted, contract])

  useEffect(() => {
    updateTokenLockerCount()
  }, [updateTokenLockerCount])

  useEffect(() => {
    setContract(undefined)
    if (!eitherChainId) return
    mounted(getContract('TokenLockerManagerV1'))
      .then(setContract)
      .catch((err: Error) => {
        setContract(undefined)
      })
  }, [mounted, getContract, eitherChainId])

  useEffect(() => {
    if (!contract || !updateTokenLockerCount) {
      return
    }

    contract.on('TokenLockerCreated', updateTokenLockerCount)

    const _contract = contract

    return () => {
      _contract?.off('TokenLockerCreated', updateTokenLockerCount)
    }
  }, [contract, updateTokenLockerCount])

  return (
    <TokenLockerManagerV1ContractContext.Provider
      value={{
        //
        contract,
        address: contract?.address,
        tokenLockerCount,
        updateTokenLockerCount,
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
