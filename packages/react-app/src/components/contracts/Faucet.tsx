import React, { createContext, useEffect, useState } from 'react'
import contracts from '../../contracts/production_contracts.json'
import { useWeb3React } from '@web3-react/core'
import { Contract } from 'ethers'
import { Web3Provider } from '@ethersproject/providers'

export interface IFaucetContext {
  //
  contract?: Contract
}

export const FaucetContext = createContext<IFaucetContext>({
  //
})

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

    const chains = (contracts as any)[chainId.toString()]
    const key = Object.keys(chains)[0]
    const _contract = chains[key]?.contracts['Faucet']

    setAddress(_contract?.address)
    setAbi(_contract?.abi)
  }, [chainId])

  useEffect(() => {
    if (!connector || !abi || !address) {
      setContract(undefined)
      return
    }

    //
    connector
      .getProvider()
      .then((_provider: any) => setContract(new Contract(address, abi, new Web3Provider(_provider.getSigner()))))
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
