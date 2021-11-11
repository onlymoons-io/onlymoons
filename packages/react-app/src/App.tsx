import React from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'

import tw from 'tailwind-styled-components'

import NavBar from './components/NavBar'
import Home from './components/Home'
import Locker from './components/Locker'

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

const App: React.FC = () => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Router>
        <Outer>
          <NavBar />

          <Routes>
            <Route path="/locker" element={<Locker />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </Outer>
      </Router>
    </Web3ReactProvider>
  )
}

export default App
