import React, { createContext, useState, useRef } from 'react'
import { useMount } from 'react-use'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'

import tw from 'tailwind-styled-components'

import NotificationCatcherContextProvider from './components/NotificationCatcher'

import UtilContractContextProvider from './components/contracts/Util'
import TokenLockerManagerV1ContractContextProvider from './components/contracts/TokenLockerManagerV1'

import FullscreenLoading from './components/FullscreenLoading'

import LeftNav from './components/LeftNav'
import NavBar from './components/NavBar'
import Home from './components/Home'
import Locker from './components/Locker'
import ManageLockers from './components/Locker/Account'
import CreateLocker from './components/Locker/Create'
import Staking from './components/Staking'
import CreateStaking from './components/Staking/Create'
import DarkModeToggle from './components/DarkModeToggle'
import ModalControllerProvider from './components/ModalController'

import './App.css'

import { Web3ReactProvider } from '@web3-react/core'
import { AbstractConnector } from '@web3-react/abstract-connector'

import { providers } from 'ethers'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faEllipsisH } from '@fortawesome/free-solid-svg-icons'
const { Web3Provider } = providers

function getLibrary(provider?: any, connector?: AbstractConnector) {
  return new Web3Provider(provider)
}

const Outer = tw.div`
  flex
`

const LeftArea = tw.div`
  border-gray-300
  dark:border-gray-800
  transition-all
  duration-200
  fixed
  left-0
  top-0
  bottom-0
  pt-16
  z-20
  flex
  flex-col
  justify-between
`

const BottomLeftArea = tw.div`
  bg-gray-200
  dark:bg-gray-900
  border-t
  border-gray-300
  dark:border-gray-800
  w-full
  p-2
  flex
  flex-col
  justify-center
  items-start
  text-gray-800
  dark:text-gray-200
`

const RightArea = tw.div`
  mt-16
  ml-16
  w-full
  flex
  flex-col
  relative
  overflow-x-hidden
`

/** this will always be true on localhost, because we don't care about https */
const IS_HTTPS = window.location.hostname === 'localhost' || window.location.protocol.startsWith('https')

export interface IAppNavState {
  leftNavExpanded: boolean
  setLeftNavExpanded: (value: boolean) => void
}

export const AppNavState = createContext<IAppNavState>({
  leftNavExpanded: false,
  setLeftNavExpanded: () => {},
})

const AppContent: React.FC = () => {
  const [leftNavExpanded, setLeftNavExpanded] = useState<boolean>(false)
  const mouseLeaveTimer = useRef<NodeJS.Timeout>()

  return (
    <AppNavState.Provider
      value={{
        //
        leftNavExpanded,
        setLeftNavExpanded,
      }}
    >
      <ModalControllerProvider>
        <Outer>
          <LeftArea
            className={`${leftNavExpanded ? 'w-64 border-r-0' : 'w-16 border-r'}`}
            onMouseEnter={() => {
              mouseLeaveTimer.current && clearTimeout(mouseLeaveTimer.current)
              setLeftNavExpanded(true)
            }}
            onMouseLeave={() => {
              //
              mouseLeaveTimer.current && clearTimeout(mouseLeaveTimer.current)

              mouseLeaveTimer.current = setTimeout(() => {
                setLeftNavExpanded(false)
              }, 500)
            }}
          >
            <LeftNav />
            <BottomLeftArea className={`${leftNavExpanded ? 'border-r' : 'border-r-0'}`}>
              <DarkModeToggle className="-ml-1" />
            </BottomLeftArea>
          </LeftArea>

          <RightArea>
            <NavBar />

            <Routes>
              <Route path="/locker/account/:account" element={<ManageLockers />} />
              <Route path="/locker/create" element={<CreateLocker />} />
              <Route path="/locker/:chainId/:id" element={<Locker />} />
              <Route path="/locker" element={<Locker />} />
              <Route path="/staking/create" element={<CreateStaking />} />
              <Route path="/staking" element={<Staking />} />
              <Route path="/" element={<Home />} />
            </Routes>
          </RightArea>

          {/* {leftNavExpanded && <div className="absolute inset-0 left-64 bg-gray-900 bg-opacity-80 z-50" />} */}
        </Outer>
      </ModalControllerProvider>
    </AppNavState.Provider>
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
        <NotificationCatcherContextProvider>
          <UtilContractContextProvider>
            <TokenLockerManagerV1ContractContextProvider>
              <AppContent />
            </TokenLockerManagerV1ContractContextProvider>
          </UtilContractContextProvider>
        </NotificationCatcherContextProvider>
      </Router>
    </Web3ReactProvider>
  ) : (
    <FullscreenLoading children="Redirecting to HTTPS..." />
  )
}

export default App
