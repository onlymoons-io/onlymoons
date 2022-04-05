import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Contract } from 'ethers'
import { useContractCache } from './ContractCache'
import { GlobalStakingData, SplitStakingRewardsData, AllRewardsForAddress } from '../../typings'
import { usePromise } from 'react-use'

export interface ISplitStakingV1ContractContext {
  //
  contract?: Contract
  address?: string
  owner?: string
  globalStakingData?: GlobalStakingData
  canDistribute?: boolean

  setSoloStakingAddress?: (address: string) => Promise<void>
  setLpStakingAddress?: (address: string) => Promise<void>
  getGlobalStakingData?: () => Promise<GlobalStakingData>
  distribute?: () => Promise<void>
  getRewardsRatio?: () => Promise<number>
  getStakingRewards?: () => Promise<SplitStakingRewardsData>
  getSplitStakingRewardsForAddress?: (account: string) => Promise<AllRewardsForAddress>
  claimSplitStaking?: () => Promise<void>
}

export const SplitStakingV1ContractContext = createContext<ISplitStakingV1ContractContext>({
  //
  // canDistribute: false,
})

export const useSplitStakingV1Contract = () => {
  const context = useContext(SplitStakingV1ContractContext)
  if (!context)
    throw new Error('useSplitStakingV1Contract can only be used within SplitStakingV1ContractContextProvider')
  return context
}

const SplitStakingV1ContractContextProvider: React.FC = ({ children }) => {
  const mounted = usePromise()
  const { getContract } = useContractCache()
  const [contract, setContract] = useState<Contract>()
  const [owner, setOwner] = useState<string>()
  const [globalStakingData, setGlobalStakingData] = useState<GlobalStakingData>()
  const [canDistribute, setCanDistribute] = useState<boolean>(false)

  const setSoloStakingAddress = useCallback(
    async (address: string) => {
      await (await contract?.setSoloStakingAddress(address)).wait()
    },
    [contract],
  )

  const setLpStakingAddress = useCallback(
    async (address: string) => {
      await (await contract?.setLpStakingAddress(address)).wait()
    },
    [contract],
  )

  const getGlobalStakingData = useCallback(async () => {
    return await contract?.getGlobalStakingData()
  }, [contract])

  const distribute = useCallback(async () => {
    await (await contract?.distribute()).wait()
  }, [contract])

  const getStakingRewards = useCallback(async () => {
    return await contract?.getStakingRewards()
  }, [contract])

  const claimSplitStaking = useCallback(async () => {
    await (await contract?.claimSplitStaking()).wait()
  }, [contract])

  const getSplitStakingRewardsForAddress = useCallback(
    async (account: string) => {
      return await contract?.getSplitStakingRewardsForAddress(account)
    },
    [contract],
  )

  const getRewardsRatio = useCallback(async () => {
    return await contract?.getRewardsRatio()
  }, [contract])

  useEffect(() => {
    mounted(getContract('SplitStakingV1'))
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

    mounted<string | undefined>(contract.owner())
      .then(setOwner)
      .catch((err: Error) => {
        console.error(err)
        setOwner(undefined)
      })
  }, [mounted, contract])

  useEffect(() => {
    if (!contract) {
      setGlobalStakingData(undefined)
      return
    }

    mounted(getGlobalStakingData())
      .then(setGlobalStakingData)
      .catch((err) => {
        console.error(err)
      })
  }, [mounted, contract, getGlobalStakingData])

  useEffect(() => {
    if (!contract) {
      setCanDistribute(false)
      return
    }

    mounted<boolean>(contract.canDistribute())
      .then(setCanDistribute)
      .catch((err: Error) => {
        console.error(err)
      })
  }, [mounted, contract])

  return (
    <SplitStakingV1ContractContext.Provider
      value={
        !contract
          ? {}
          : {
              contract,
              address: contract.address,
              owner,
              globalStakingData,
              setSoloStakingAddress,
              setLpStakingAddress,
              getGlobalStakingData,
              distribute,
              getStakingRewards,
              canDistribute,
              claimSplitStaking,
              getSplitStakingRewardsForAddress,
              getRewardsRatio,
            }
      }
    >
      {children}
    </SplitStakingV1ContractContext.Provider>
  )
}

export default SplitStakingV1ContractContextProvider
