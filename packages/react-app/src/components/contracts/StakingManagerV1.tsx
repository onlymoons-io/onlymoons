import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { BigNumber, Contract } from 'ethers'
import { ContractCacheContext } from './ContractCache'
import { StakingData, GlobalStakingData, AllRewardsForAddress } from '../../typings'

export interface IStakingManagerV1ContractContext {
  contract?: Contract
  address?: string
  count?: number
  owner?: string
  globalStakingData?: GlobalStakingData

  stakingEnabledOnNetwork?: (chainId?: number) => boolean
  getFeeAmountForType?: (feeType: string) => Promise<BigNumber>
  createStaking?: (tokenAddress: string, name: string, lockDurationDays: number) => Promise<number>
  getStakingDataByAddress?: (address: string) => Promise<StakingData>
  getStakingDataById?: (id: number) => Promise<StakingData>
  getAllRewardsForAddress?: (account: string) => Promise<AllRewardsForAddress>
  claimAll?: () => Promise<void>
}

export const StakingManagerV1ContractContext = createContext<IStakingManagerV1ContractContext>({
  // count: 0,
  // stakingEnabledOnNetwork: () => false,
})

const StakingManagerV1ContractContextProvider: React.FC = ({ children }) => {
  const { getContract } = useContext(ContractCacheContext)
  const [contract, setContract] = useState<Contract>()
  const [count, setCount] = useState<number>(0)
  const [owner, setOwner] = useState<string>()

  const stakingEnabledOnNetwork = (_chainId?: number) => {
    switch (_chainId) {
      case 97:
        return true
      default:
        return false
    }
  }

  const getFeeAmountForType: (feeType: string) => Promise<BigNumber> = useCallback(
    async (feeType: string) => {
      return (await contract?.getFeeAmountForType(feeType)) || BigNumber.from(0)
    },
    [contract],
  )

  const createStaking = useCallback(
    async (tokenAddress: string, name: string, lockDurationDays: number) => {
      const feeAmount = await getFeeAmountForType('CreateStaking')

      const result = await (
        await contract?.createStaking(
          tokenAddress,
          // rewards token address - pass 0 address here for eth rewards
          '0x0000000000000000000000000000000000000000',
          name,
          lockDurationDays,
          { value: feeAmount },
        )
      ).wait()

      const createdEvent = result.events.find((e: any) => e.event === 'StakingCreated')

      return createdEvent?.args?.id || 0
    },
    [contract, getFeeAmountForType],
  )

  const getStakingDataByAddress = useCallback(
    async (address: string) => {
      return await contract?.getStakingDataByAddress(address)
    },
    [contract],
  )

  const getStakingDataById = useCallback(
    async (id: number) => {
      return await contract?.getStakingDataById(id)
    },
    [contract],
  )

  const claimAll = useCallback(async () => {
    await (await contract?.claimAll()).wait()
  }, [contract])

  const getAllRewardsForAddress = useCallback(
    async (account: string) => {
      return await contract?.getAllRewardsForAddress(account)
    },
    [contract],
  )

  useEffect(() => {
    getContract('StakingManagerV1')
      .then(setContract)
      .catch((err: Error) => {
        console.error(err)
        setContract(undefined)
      })
  }, [getContract])

  useEffect(() => {
    if (!contract) {
      setCount(0)
      setOwner(undefined)
      return
    }

    Promise.all([contract.count(), contract.owner()])
      .then(([_count, _owner]) => {
        setCount(_count.toNumber())
        setOwner(_owner)
      })
      .catch((err: Error) => {
        console.error(err)
        setCount(0)
        setOwner(undefined)
      })
  }, [contract])

  return (
    <StakingManagerV1ContractContext.Provider
      value={
        !contract
          ? {}
          : {
              contract,
              address: contract.address,
              count,
              owner,
              stakingEnabledOnNetwork,
              getFeeAmountForType,
              createStaking,
              getStakingDataByAddress,
              getStakingDataById,
              claimAll,
              getAllRewardsForAddress,
            }
      }
    >
      {children}
    </StakingManagerV1ContractContext.Provider>
  )
}

export default StakingManagerV1ContractContextProvider
