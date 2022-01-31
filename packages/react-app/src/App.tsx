import React, { createContext, useState, useRef, useEffect } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'

import tw from 'tailwind-styled-components'

import NotificationCatcherContextProvider from './components/NotificationCatcher'

import ContractCacheContextProvider from './components/contracts/ContractCache'
import UtilContractContextProvider from './components/contracts/Util'
import TokenLockerManagerV1ContractContextProvider from './components/contracts/TokenLockerManagerV1'
import PriceTrackerContextProvider from './components/contracts/PriceTracker'
import FeesContractContextProvider from './components/contracts/Fees'

import LockWatchlistProvider from './components/Locker/LockWatchlist'

import FullscreenLoading from './components/FullscreenLoading'

import LeftNav from './components/LeftNav'
import NavBar from './components/NavBar'
import Home from './components/Home'
import Locker from './components/Locker'
import ManageLockers from './components/Locker/Account'
import CreateLocker from './components/Locker/Create'
import Staking from './components/Staking'
// import CreateStaking from './components/Staking/Create'
import DarkModeToggle from './components/DarkModeToggle'
import ModalControllerProvider from './components/ModalController'
import ComingSoon from './components/ComingSoon'
import Faucets from './components/Faucets'

import './App.css'

import { networks } from './util/getNetworkDataByChainId'

import { useWeb3React, Web3ReactProvider } from '@web3-react/core'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { NetworkConnector } from '@web3-react/network-connector'

import { providers } from 'ethers'
import { usePromise } from 'react-use'

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
const IS_HTTPS =
  window.location.hostname.startsWith('localhost') ||
  window.location.hostname.startsWith('192.168.1.') ||
  window.location.protocol.startsWith('https')

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
              <Route path="/launches" element={<ComingSoon />} />
              <Route path="/deployer" element={<ComingSoon />} />
              <Route
                path="/locker/search/:account"
                element={
                  <TokenLockerManagerV1ContractContextProvider>
                    <LockWatchlistProvider children={<ManageLockers />} />
                  </TokenLockerManagerV1ContractContextProvider>
                }
              />
              <Route
                path="/locker/account/:account"
                element={
                  <TokenLockerManagerV1ContractContextProvider>
                    <LockWatchlistProvider children={<ManageLockers />} />
                  </TokenLockerManagerV1ContractContextProvider>
                }
              />
              <Route
                path="/locker/create"
                element={
                  <TokenLockerManagerV1ContractContextProvider>
                    <LockWatchlistProvider children={<CreateLocker />} />
                  </TokenLockerManagerV1ContractContextProvider>
                }
              />
              <Route
                path="/locker/watchlist"
                element={
                  <TokenLockerManagerV1ContractContextProvider>
                    <LockWatchlistProvider children={<Locker useWatchlist={true} />} />{' '}
                  </TokenLockerManagerV1ContractContextProvider>
                }
              />
              <Route
                path="/locker/:chainId/:id"
                element={
                  <TokenLockerManagerV1ContractContextProvider>
                    <LockWatchlistProvider children={<Locker />} />
                  </TokenLockerManagerV1ContractContextProvider>
                }
              />
              <Route
                path="/locker"
                element={
                  <TokenLockerManagerV1ContractContextProvider>
                    <LockWatchlistProvider children={<Locker />} />
                  </TokenLockerManagerV1ContractContextProvider>
                }
              />
              {/* <Route path="/staking/create" element={<CreateStaking />} /> */}
              <Route path="/staking/deploy" element={<Staking viewMode="deploy" />} />
              <Route path="/staking/all" element={<Staking viewMode="all" />} />
              <Route path="/staking" element={<Staking viewMode="split" />} />
              <Route path="/governance" element={<ComingSoon />} />
              <Route path="/faucet" element={<Faucets />} />
              <Route path="/stats" element={<ComingSoon />} />
              <Route path="/" element={<Home />} />
            </Routes>
          </RightArea>

          {/* {leftNavExpanded && <div className="absolute inset-0 left-64 bg-gray-900 bg-opacity-80 z-50" />} */}
        </Outer>
      </ModalControllerProvider>
    </AppNavState.Provider>
  )
}

const AppWeb3: React.FC = () => {
  const mounted = usePromise()
  const { account, activate, connector, chainId } = useWeb3React()
  const [connecting, setConnecting] = useState<boolean>(false)

  useEffect(() => {
    if (chainId !== undefined) {
      window.localStorage.setItem('OM_DEFAULT_CHAINID', chainId.toString())
    }
  }, [chainId])

  useEffect(() => {
    if (!connecting && !account && !connector && window.localStorage.getItem('ONLYMOONS_AUTO_CONNECT') !== '1') {
      setConnecting(true)
      // if (connector && !(connector instanceof NetworkConnector)) {
      //   return
      // }

      // connector instanceof NetworkConnector && deactivate()

      const urls: Record<number, string> = {}

      Object.keys(networks)
        .map(chainId => parseInt(chainId))
        .forEach(chainId => {
          urls[chainId] = networks[chainId].rpcURL
        })

      mounted(
        activate(
          new NetworkConnector({
            urls,
            defaultChainId: parseInt(window.localStorage.getItem('OM_DEFAULT_CHAINID') ?? '56'),
          }),
        ),
      ).then(() => setConnecting(false))
    }
  }, [mounted, account, activate, connector, connecting])

  return (
    <Router>
      <NotificationCatcherContextProvider>
        <ContractCacheContextProvider>
          <UtilContractContextProvider>
            <PriceTrackerContextProvider>
              <FeesContractContextProvider>
                <AppContent />
              </FeesContractContextProvider>
            </PriceTrackerContextProvider>
          </UtilContractContextProvider>
        </ContractCacheContextProvider>
      </NotificationCatcherContextProvider>
    </Router>
  )
}

const App: React.FC = () => {
  return IS_HTTPS ? (
    <Web3ReactProvider getLibrary={getLibrary}>
      <AppWeb3 />
    </Web3ReactProvider>
  ) : (
    <FullscreenLoading children="Redirecting to HTTPS..." />
  )
}

export default App
