import React from 'react'
import { useMount } from 'react-use'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'

import tw from 'tailwind-styled-components'

import UtilContractContextProvider from './components/contracts/Util'
import TokenLockerManagerV1ContractContextProvider from './components/contracts/TokenLockerManagerV1'

import FullscreenLoading from './components/FullscreenLoading'

import NavBar from './components/NavBar'
import Home from './components/Home'
import Locker from './components/Locker'
import ManageLockers from './components/Locker/Account'
import CreateLocker from './components/Locker/Create'

import './App.css'

import { Web3ReactProvider } from '@web3-react/core'
import { AbstractConnector } from '@web3-react/abstract-connector'

import { providers } from 'ethers'
const { Web3Provider } = providers

function getLibrary(provider?: any, connector?: AbstractConnector) {
  return new Web3Provider(provider)
}

const Outer = tw.div`
  flex
  flex-col
  mt-16
`

/** this will always be true on localhost, because we don't care about https */
const IS_HTTPS = window.location.hostname === 'localhost' || window.location.protocol.startsWith('https')

const AppContent: React.FC = () => {
  return (
    <Outer>
      <NavBar />

      <Routes>
        <Route path="/locker/account/:account" element={<ManageLockers />} />
        <Route path="/locker/create" element={<CreateLocker />} />
        <Route path="/locker/:chainId/:id" element={<Locker />} />
        <Route path="/locker" element={<Locker />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Outer>
  )
}

const App: React.FC = () => {
  useMount(() => {
    if (!IS_HTTPS) {
      const url = new URL(window.location.href)
      url.protocol = 'https:'
      window.location.assign(url.href)
    }
  })

  return IS_HTTPS ? (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Router>
        <UtilContractContextProvider>
          <TokenLockerManagerV1ContractContextProvider>
            <AppContent />
          </TokenLockerManagerV1ContractContextProvider>
        </UtilContractContextProvider>
      </Router>
    </Web3ReactProvider>
  ) : (
    <FullscreenLoading children="Redirecting to HTTPS..." />
  )
}

export default App
