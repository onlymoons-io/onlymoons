import React, { createContext, useEffect, useState, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Contract, providers } from 'ethers'
import contracts from '../../contracts/production_contracts.json'
import { StakingData, StakingDataForAccount, GlobalStakingData } from '../../typings'

const { Web3Provider } = providers

export interface IStakingManagerV1ContractContext {
  //
  contract?: Contract
  address?: string
  count: number
  owner?: string
  globalStakingData?: GlobalStakingData

  createStaking?: (tokenAddress: string, name: string, lockDurationDays: number) => Promise<number>
  getStakingData?: (id: number) => Promise<StakingData>
  // getStakingDataForAccount?: (id: number, account: string) => Promise<StakingDataForAccount>
  setSoloStakingId?: (id: number) => Promise<void>
  setLpStakingId?: (id: number) => Promise<void>
  getGlobalStakingData?: () => Promise<GlobalStakingData>
}

export const StakingManagerV1ContractContext = createContext<IStakingManagerV1ContractContext>({
  //
  count: 0,
})

const StakingManagerV1ContractContextProvider: React.FC = ({ children }) => {
  const { chainId, connector } = useWeb3React()
  const [address, setAddress] = useState<string>()
  const [abi, setAbi] = useState<any>()
  const [contract, setContract] = useState<Contract>()
  const [count, setCount] = useState<number>(0)
  const [owner, setOwner] = useState<string>()
  const [globalStakingData, setGlobalStakingData] = useState<GlobalStakingData>()

  const setSoloStakingId = useCallback(
    async (id: number) => {
      if (!contract) {
        throw new Error('Staking contract is not loaded')
      }

      const tx = await contract.setSoloStakingId(id)

      await tx.wait()
    },
    [contract],
  )

  const setLpStakingId = useCallback(
    async (id: number) => {
      if (!contract) {
        throw new Error('Staking contract is not loaded')
      }

      const tx = await contract.setLpStakingId(id)

      await tx.wait()
    },
    [contract],
  )

  const createStaking = useCallback(
    async (tokenAddress: string, name: string, lockDurationDays: number) => {
      //
      if (!contract) {
        throw new Error('Staking contract is not loaded')
      }

      const tx = await contract.createStaking(tokenAddress, name, lockDurationDays)

      const result = await tx.wait()

      const createdEvent = result.events.find((e: any) => e.event === 'StakingCreated')

      return createdEvent?.args?.id || 0
    },
    [contract],
  )

  const getStakingData = useCallback(
    async (id: number) => {
      if (!contract) {
        throw new Error('Staking contract is not loaded')
      }

      return { ...(await contract.getStakingData(id)), id }
    },
    [contract],
  )

  // const getStakingDataForAccount = useCallback(
  //   async (id: number, account: string) => {
  //     if (!contract) {
  //       throw new Error('Staking contract is not loaded')
  //     }

  //     return await contract.getStakingDataForAccount(id, account)
  //   },
  //   [contract],
  // )

  const getGlobalStakingData = useCallback(async () => {
    if (!contract) {
      throw new Error('Staking contract is not loaded')
    }

    return await contract.getGlobalStakingData()
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
        setCount(_count)
        setOwner(_owner)
      })
      .catch((err: Error) => {
        console.error(err)
        setCount(0)
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
        //
        console.error(err)
      })
  }, [contract, getGlobalStakingData])

  return (
    <StakingManagerV1ContractContext.Provider
      value={{
        //
        contract,
        address,
        count,
        owner,
        globalStakingData,
        setSoloStakingId,
        setLpStakingId,
        createStaking,
        getStakingData,
        // getStakingDataForAccount,
        getGlobalStakingData,
      }}
    >
      {children}
    </StakingManagerV1ContractContext.Provider>
  )
}

export default StakingManagerV1ContractContextProvider
