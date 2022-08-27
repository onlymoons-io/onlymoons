import React, { createContext, useContext, useEffect, useState } from 'react'
import _contracts from '../../contracts/compiled_contracts.json'
import { useWeb3React } from '@web3-react/core'
import { Contract } from 'ethers'
import { Web3Provider } from '@ethersproject/providers'

const contracts = _contracts as any

export interface IFaucetContext {
  //
  contract?: Contract
}

export const FaucetContext = createContext<IFaucetContext>({
  //
})

export const useFaucetContract = () => {
  const context = useContext(FaucetContext)
  if (!context) throw new Error('useFaucetContract can only be used within FaucetContextProvider')
  return context
}

const FaucetContextProvider: React.FC = ({ children }) => {
  const { chainId, connector } = useWeb3React()
  const [contract, setContract] = useState<Contract>()
  const [abi, setAbi] = useState<any>()
  const [address, setAddress] = useState<string>()

  useEffect(() => {
    if (!chainId) {
      setAddress(undefined)
      setAbi(undefined)
      return
    }

    setAddress(
      contracts.Faucet?.networks[chainId.toString()][Object.keys(contracts.Faucet?.networks[chainId.toString()])[0]],
    )
    setAbi(contracts.Faucet?.abi)
  }, [chainId])

  useEffect(() => {
    if (!connector || !abi || !address) {
      setContract(undefined)
      return
    }

    //
    connector
      .getProvider()
      .then((_provider: any) => setContract(new Contract(address, abi, new Web3Provider(_provider.getSigner(), 'any'))))
      .catch((err: Error) => {
        console.error(err)
        setContract(undefined)
      })
  }, [connector, abi, address])

  return (
    <FaucetContext.Provider
      value={{
        contract,
      }}
    >
      {children}
    </FaucetContext.Provider>
  )
}

export default FaucetContextProvider
