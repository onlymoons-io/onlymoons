import React, { createContext, useContext, useState, useRef, useEffect } from 'react'
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
import Fundraising from './components/Fundraising'
import Bridge from './components/Bridge'
import NetworkSwitcherProvider from './components/NetworkSwitcher'

import './App.css'

import { networks } from './util/getNetworkDataByChainId'

import { Web3ReactProvider, createWeb3ReactRoot, getWeb3ReactContext, useWeb3React } from '@web3-react/core'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { NetworkConnector } from '@web3-react/network-connector'

import { providers } from 'ethers'
import { createBreakpoint, usePromise } from 'react-use'

const { Web3Provider } = providers

function getLibrary(provider?: any, connector?: AbstractConnector) {
  return new Web3Provider(provider, 'any')
}

const Outer = tw.div`
  flex
`

interface AreaProps {
  $expanded?: boolean
}

const LeftArea = tw.div<AreaProps>`
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
  justify-between
  ${(p) => (p.$expanded ? 'flex w-64 border-r-0' : 'hidden md:flex w-16 border-r')}
  flex-col
`

const BottomLeftArea = tw.div<AreaProps>`
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
  ${(p) => (p.$expanded ? 'border-r' : 'border-r-0')}
`

const RightArea = tw.div`
  mt-16
  md:ml-16
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
  isSmall: boolean
  leftNavExpanded: boolean
  setLeftNavExpanded: (value: boolean) => void
}

export const AppNavState = createContext<IAppNavState>({
  isSmall: false,
  leftNavExpanded: false,
  setLeftNavExpanded: () => {},
})

export const useAppNavState = () => {
  const appNavState = useContext(AppNavState)
  if (!appNavState) throw new Error('useAppNavState can only be used within AppNavState provider')
  return appNavState
}

const useBreakpoint = createBreakpoint({
  notsmall: 768,
})

const AppContent: React.FC = () => {
  const breakpoint = useBreakpoint()
  const [leftNavExpanded, setLeftNavExpanded] = useState<boolean>(false)
  const [isSmall, setIsSmall] = useState<boolean>(breakpoint !== 'notsmall')
  const mouseLeaveTimer = useRef<NodeJS.Timeout>()

  useEffect(() => {
    setIsSmall(breakpoint !== 'notsmall')
  }, [breakpoint])

  return (
    <AppNavState.Provider
      value={{
        //
        isSmall,
        leftNavExpanded,
        setLeftNavExpanded,
      }}
    >
      <Outer>
        <LeftArea
          $expanded={leftNavExpanded}
          onMouseEnter={() => {
            mouseLeaveTimer.current && clearTimeout(mouseLeaveTimer.current)
            !isSmall && setLeftNavExpanded(true)
          }}
          onMouseLeave={() => {
            mouseLeaveTimer.current && clearTimeout(mouseLeaveTimer.current)
            if (!isSmall) {
              mouseLeaveTimer.current = setTimeout(() => {
                setLeftNavExpanded(false)
              }, 500)
            }
          }}
        >
          <LeftNav />
          <BottomLeftArea $expanded={leftNavExpanded}>
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
            <Route path="/bridge" element={<Bridge />} />
            {/* <Route path="/staking/create" element={<CreateStaking />} /> */}
            <Route path="/staking/deploy" element={<Staking viewMode="deploy" />} />
            <Route path="/staking/all" element={<Staking viewMode="all" />} />
            <Route path="/staking" element={<Staking viewMode="split" />} />
            <Route path="/fundraising" element={<Fundraising />} />
            <Route path="/governance" element={<ComingSoon />} />
            <Route path="/faucet" element={<Faucets />} />
            <Route path="/stats" element={<ComingSoon />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </RightArea>

        {/* {leftNavExpanded && <div className="absolute inset-0 left-64 bg-gray-900 bg-opacity-80 z-50" />} */}
      </Outer>
    </AppNavState.Provider>
  )
}

const AppWeb3: React.FC = () => {
  const mounted = usePromise()
  const { chainId: connectedChainId } = useWeb3React()
  const { activate, connector, chainId } = useContext(getWeb3ReactContext('constant'))
  const [connecting, setConnecting] = useState<boolean>(false)

  useEffect(() => {
    if (connectedChainId && connector instanceof NetworkConnector) {
      connector.changeChainId(connectedChainId)
    }
  }, [connectedChainId, connector])

  useEffect(() => {
    if (chainId !== undefined) {
      window.localStorage.setItem('OM_DEFAULT_CHAINID', chainId.toString())
    }
  }, [chainId])

  useEffect(() => {
    if (!connecting && !connector /* && window.localStorage.getItem('ONLYMOONS_AUTO_CONNECT') !== '1' */) {
      setConnecting(true)
      // if (connector && !(connector instanceof NetworkConnector)) {
      //   return
      // }

      // connector instanceof NetworkConnector && deactivate()

      const urls: Record<number, string> = {}

      Object.keys(networks)
        .map((chainId) => parseInt(chainId))
        .forEach((chainId) => {
          urls[chainId] = networks[chainId].rpcURL
        })

      mounted(
        activate(
          new NetworkConnector({
            urls,
            defaultChainId: parseInt(window.localStorage.getItem('OM_DEFAULT_CHAINID') ?? '1'),
          }),
        ),
      ).then(() => setConnecting(false))
    }
  }, [mounted, activate, connector, connecting])

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

export const Web3ReactProviderConstant = createWeb3ReactRoot('constant')

const App: React.FC = () => {
  return IS_HTTPS ? (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ReactProviderConstant getLibrary={getLibrary}>
        <NetworkSwitcherProvider>
          <ModalControllerProvider>
            <AppWeb3 />
          </ModalControllerProvider>
        </NetworkSwitcherProvider>
      </Web3ReactProviderConstant>
    </Web3ReactProvider>
  ) : (
    <FullscreenLoading children="Redirecting to HTTPS..." />
  )
}

export default App
