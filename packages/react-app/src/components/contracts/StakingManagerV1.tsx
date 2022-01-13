import React, { createContext, useEffect, useState, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Contract, providers } from 'ethers'
import contracts from '../../contracts/production_contracts.json'
import { StakingData, GlobalStakingData, AllRewardsForAddress } from '../../typings'

const { Web3Provider } = providers

export interface IStakingManagerV1ContractContext {
  contract?: Contract
  address?: string
  count?: number
  owner?: string
  globalStakingData?: GlobalStakingData

  stakingEnabledOnNetwork?: (chainId?: number) => boolean
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
  const { chainId, connector } = useWeb3React()
  const [address, setAddress] = useState<string>()
  const [abi, setAbi] = useState<any>()
  const [contract, setContract] = useState<Contract>()
  const [count, setCount] = useState<number>(0)
  const [owner, setOwner] = useState<string>()

  const stakingEnabledOnNetwork = (chainId?: number) => {
    switch (chainId) {
      case 97:
        return true
      default:
        return false
    }
  }

  const createStaking = useCallback(
    async (tokenAddress: string, name: string, lockDurationDays: number) => {
      const result = await (await contract?.createStaking(tokenAddress, name, lockDurationDays)).wait()

      const createdEvent = result.events.find((e: any) => e.event === 'StakingCreated')

      return createdEvent?.args?.id || 0
    },
    [contract],
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
        setAddress(contracts['97'].bsctest.contracts.StakingManagerV1.address)
        setAbi(contracts['97'].bsctest.contracts.StakingManagerV1.abi)
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
              address,
              count,
              owner,
              stakingEnabledOnNetwork,
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
