import React, { ReactNode, createContext, useContext, useEffect, useState, useCallback } from 'react'
import { BigNumber, Contract } from 'ethers'
import { useContractCache } from './ContractCache'
import { LPLockData, TokenLockData, UniV3LPData } from '../../typings'
import { usePromise } from 'react-use'
import { useWeb3React, getWeb3ReactContext } from '@web3-react/core'

export interface ITokenLockerManagerContractContext {
  //
  contract?: Contract
  address?: string
  tokenLockerCount: number

  updateTokenLockerCount?: () => Promise<void>
  createTokenLocker?: (tokenAddress: string, amount: BigNumber, unlockTime: number) => Promise<number>
  getTokenLockersForAddress?: (address: string) => Promise<Array<number>>
  getTokenLockData?: (id: number) => Promise<TokenLockData>
  getLpData?: (id: number) => Promise<LPLockData>
  getUniV3LpData?: (id: number) => Promise<UniV3LPData>
}

export const TokenLockerManagerContractContext = createContext<ITokenLockerManagerContractContext>({
  //
  tokenLockerCount: 0,
})

export const useTokenLockerManagerContract = () => {
  const context = useContext(TokenLockerManagerContractContext)
  if (!context)
    throw new Error('useTokenLockerManagerContract can only be used within TokenLockerManagerContractContextProvider')
  return context
}

export interface TokenLockerManagerContractContextProviderProps {
  children?: ReactNode
  lockType?: number
}

const TokenLockerManagerContractContextProvider: React.FC<TokenLockerManagerContractContextProviderProps> = ({
  children,
  lockType = 1,
}) => {
  const mounted = usePromise()
  const { getContract } = useContractCache()
  const [contract, setContract] = useState<Contract>()
  const [tokenLockerCount, setTokenLockerCount] = useState<number>(0)
  const { chainId } = useWeb3React()
  const { chainId: chainIdConstant } = useContext(getWeb3ReactContext('constant') as React.Context<any>)

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

  const getUniV3LpData = useCallback(
    async (id: number) => {
      if (!contract) {
        throw new Error('Token locker contract is not loaded')
      }

      if (lockType !== 3) {
        throw new Error('Invalid lockType - must be a UniV3 locker')
      }

      return {
        //
        ...(await contract.getUniV3LpData(id)),
        hasLpData: true,
        id,
      }
    },
    [contract, lockType],
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

  const getLockContract = useCallback(() => {
    switch (lockType) {
      case 1:
      default:
        return 'TokenLockerManagerV1'
      case 2:
        return 'TokenLockerUniV2'
      case 3:
        return 'TokenLockerUniV3'
    }
  }, [lockType])

  useEffect(() => {
    updateTokenLockerCount()
  }, [updateTokenLockerCount])

  useEffect(() => {
    setContract(undefined)
    if (!eitherChainId) return
    mounted(getContract(getLockContract()))
      .then(setContract)
      .catch((err: Error) => {
        setContract(undefined)
      })
  }, [mounted, getContract, eitherChainId, getLockContract])

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
    <TokenLockerManagerContractContext.Provider
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
        getUniV3LpData,
      }}
    >
      {children}
    </TokenLockerManagerContractContext.Provider>
  )
}

export default TokenLockerManagerContractContextProvider
