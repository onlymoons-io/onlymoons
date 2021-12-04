import React, { createContext, useEffect, useState, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { BigNumber, Contract, providers } from 'ethers'
import contracts from '../../contracts/production_contracts.json'
import { LPLockData, TokenLockData } from '../../typings'

const { Web3Provider } = providers

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
  const { chainId, connector } = useWeb3React()
  const [address, setAddress] = useState<string>()
  const [abi, setAbi] = useState<any>()
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
        setAddress(contracts['97'].bsctest.contracts.TokenLockerManagerV1.address)
        setAbi(contracts['97'].bsctest.contracts.TokenLockerManagerV1.abi)
        break

      // bsc mainnet
      case 56:
        setAddress(contracts['56'].bsc.contracts.TokenLockerManagerV1.address)
        setAbi(contracts['56'].bsc.contracts.TokenLockerManagerV1.abi)
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
        address,
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
