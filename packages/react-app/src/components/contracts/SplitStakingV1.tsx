import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Contract } from 'ethers'
import { ContractCacheContext } from './ContractCache'
import { GlobalStakingData, SplitStakingRewardsData, AllRewardsForAddress } from '../../typings'

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

const SplitStakingV1ContractContextProvider: React.FC = ({ children }) => {
  const { getContract } = useContext(ContractCacheContext)
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
    getContract('SplitStakingV1')
      .then(setContract)
      .catch((err: Error) => {
        console.error(err)
        setContract(undefined)
      })
  }, [getContract])

  useEffect(() => {
    if (!contract) {
      setOwner(undefined)
      return
    }

    contract
      .owner()
      .then(setOwner)
      .catch((err: Error) => {
        console.error(err)
        setOwner(undefined)
      })
  }, [contract])

  useEffect(() => {
    if (!contract) {
      setGlobalStakingData(undefined)
      return
    }

    getGlobalStakingData()
      .then(setGlobalStakingData)
      .catch(err => {
        console.error(err)
      })
  }, [contract, getGlobalStakingData])

  useEffect(() => {
    if (!contract) {
      setCanDistribute(false)
      return
    }

    contract
      .canDistribute()
      .then(setCanDistribute)
      .catch((err: Error) => {
        console.error(err)
      })
  }, [contract])

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
