import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { BigNumber, Contract } from 'ethers'
import { useContractCache } from './ContractCache'
import { StakingData, GlobalStakingData, AllRewardsForAddress } from '../../typings'
import { useFeesContract } from '../contracts/Fees'
import { usePromise } from 'react-use'

export interface IStakingManagerV1ContractContext {
  contract?: Contract
  address?: string
  count?: number
  owner?: string
  globalStakingData?: GlobalStakingData

  stakingEnabledOnNetwork?: (chainId?: number) => boolean
  getFeeAmountForType?: (feeType: string) => Promise<BigNumber>
  createStaking?: (
    stakingType: number,
    tokenAddress: string,
    lockDurationDays?: number,
    data?: BigNumber[],
  ) => Promise<number>
  getStakingDataByAddress?: (address: string) => Promise<StakingData>
  getStakingDataById?: (id: number) => Promise<StakingData>
  getAllRewardsForAddress?: (account: string) => Promise<AllRewardsForAddress>
  claimAll?: () => Promise<void>
}

export const StakingManagerV1ContractContext = createContext<IStakingManagerV1ContractContext>({
  // count: 0,
  // stakingEnabledOnNetwork: () => false,
})

export const useStakingManagerV1Contract = () => {
  const context = useContext(StakingManagerV1ContractContext)
  if (!context)
    throw new Error('useStakingManagerV1Contract can only be used within StakingManagerV1ContractContextProvider')
  return context
}

const StakingManagerV1ContractContextProvider: React.FC = ({ children }) => {
  const mounted = usePromise()
  const { getFeeAmountForType } = useFeesContract()
  const { getContract } = useContractCache()
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

  const createStaking = useCallback(
    async (stakingType: number, tokenAddress: string, lockDurationDays: number = 0, data: BigNumber[] = []) => {
      if (!getFeeAmountForType) {
        throw new Error('getFeeAmountForType is not defined')
      }

      const result = await mounted<any>(
        (
          await contract?.createStaking(stakingType, tokenAddress, lockDurationDays, data, {
            value: await getFeeAmountForType('DeployStaking'),
          })
        ).wait(),
      )

      const createdEvent = result.events.find((e: any) => e.event === 'StakingCreated')

      return createdEvent?.args?.id || 0
    },
    [mounted, contract, getFeeAmountForType],
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
    mounted(getContract('StakingManagerV1'))
      .then(setContract)
      .catch((err: Error) => {
        setContract(undefined)
      })
  }, [mounted, getContract])

  useEffect(() => {
    if (!contract) {
      setCount(0)
      setOwner(undefined)
      return
    }

    mounted(Promise.all([contract.count(), contract.owner()]))
      .then(([_count, _owner]) => {
        setCount(_count.toNumber())
        setOwner(_owner)
      })
      .catch((err: Error) => {
        console.error(err)
        setCount(0)
        setOwner(undefined)
      })
  }, [mounted, contract])

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
