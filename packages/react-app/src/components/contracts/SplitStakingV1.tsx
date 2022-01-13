import React, { createContext, useEffect, useState, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Contract, providers } from 'ethers'
import contracts from '../../contracts/production_contracts.json'
import { GlobalStakingData, SplitStakingRewardsData, AllRewardsForAddress } from '../../typings'

const { Web3Provider } = providers

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
  const { chainId, connector } = useWeb3React()
  const [address, setAddress] = useState<string>()
  const [abi, setAbi] = useState<any>()
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
    // vscode is confused about some old code here, and is showing a warning
    // on TokenLockerManagerV1, even though that does exist in the json
    switch (chainId) {
      // localhost
      // case 31337:
      //   setAddress(contracts['31337'].localhost.contracts.TokenLockerManagerV1.address)
      //   setAbi(contracts['31337'].localhost.contracts.TokenLockerManagerV1.abi)
      //   break

      // bsc testnet
      case 97:
        setAddress(contracts['97'].bsctest.contracts.SplitStakingV1.address)
        setAbi(contracts['97'].bsctest.contracts.SplitStakingV1.abi)
        break

      // bsc mainnet
      case 56:
        // setAddress(contracts['56'].bsc.contracts.StakingManagerV1.address)
        // setAbi(contracts['56'].bsc.contracts.StakingManagerV1.abi)
        break

      default:
        setAddress(undefined)
        setAbi(undefined)
        break
    }
  }, [chainId])

  useEffect(() => {
    if (!address || !abi || !connector) {
      setContract(undefined)
      return
    }

    //
    connector
      .getProvider()
      .then(provider => setContract(new Contract(address, abi, new Web3Provider(provider).getSigner())))
      .catch(err => {
        console.error(err)
        setContract(undefined)
      })
  }, [address, abi, connector])

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
              address,
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
