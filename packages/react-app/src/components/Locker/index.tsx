import React, { useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { getWeb3ReactContext } from '@web3-react/core'
import { utils } from 'ethers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion'
// import { useTokenLockerManagerV1Contract } from '../contracts/TokenLockerManagerV1'
import { useTokenLockerManagerContract } from '../contracts/TokenLockerManager'
import Lock from './Lock'
import NotConnected from '../NotConnected'
import Header from './Header'
import { Outer, MidSection, SectionInner, Grid as Locks, Loading as LocksLoading } from '../Layout'
import { usePromise } from 'react-use'
import { LockWatchlist } from './LockWatchlist'
// import contracts from '../../contracts/compiled_contracts.json'
import SwitchNetworkButton from '../SwitchNetworkButton'
import getNetworkDataByChainId, { networks } from '../../util/getNetworkDataByChainId'
// import { NetworkData } from '../../typings'

// const contracts = _contracts as any

const { isAddress, getAddress } = utils

// const allNetworkData = Object.keys(contracts).map((key) => getNetworkDataByChainId(parseInt(key)) as NetworkData)

export interface LockerProps {
  useWatchlist?: boolean
  lockType?: number
}

const Locker: React.FC<LockerProps> = ({ useWatchlist = false, lockType = 1 }) => {
  const { watchlist } = useContext(LockWatchlist)
  const mounted = usePromise()
  const { account: accountToCheck, chainId: _chainIdToUse, id: idToUse } = useParams()
  const { chainId, connector } = useContext(getWeb3ReactContext('constant') as React.Context<any>)
  const { contract, getTokenLockersForAddress, tokenLockerCount } = useTokenLockerManagerContract()
  // const {
  //   contract: contractV2UniV2,
  //   getTokenLockersForAddress: getTokenLockersForAddressV2UniV2,
  //   tokenLockerCount: tokenLockerCountV2UniV2,
  // } = useTokenLockerManagerContract()
  // const contract = lockType === 1 ? contractV1 : lockType === 2 ? contractV2UniV2 : undefined
  // const getTokenLockersForAddress =
  //   lockType === 1 ? getTokenLockersForAddressV1 : lockType === 2 ? getTokenLockersForAddressV2UniV2 : undefined
  // const tokenLockerCount = lockType === 1 ? tokenLockerCountV1 : lockType === 2 ? tokenLockerCountV2UniV2 : undefined
  const [filterInputValue, setFilterInputValue] = useState<string>()
  const [lockIds, setLockIds] = useState<number[]>([])
  const wasUsingWatchlist = useRef<boolean>(false)
  const setupLockTimer = useRef<NodeJS.Timeout>()

  const networkToUse = Object.values(networks).find((networkData) => networkData.urlName === _chainIdToUse)?.chainId
  const chainIdToUse_ = networkToUse ? networkToUse : _chainIdToUse
  const chainIdToUse = typeof chainIdToUse_ === 'number' ? chainIdToUse_ : parseInt(chainIdToUse_!)

  const setupLocks = useCallback(() => {
    if (!chainId || !contract || !connector || !tokenLockerCount || !getTokenLockersForAddress) {
      setLockIds([])
      return
    }

    if (idToUse) {
      setLockIds([parseInt(idToUse)])
      wasUsingWatchlist.current = false
    } else if (useWatchlist) {
      if (wasUsingWatchlist.current) {
        setLockIds(watchlist?.map((v) => parseInt(v)) || [])
      } else {
        setLockIds([])
        mounted(new Promise((done) => setTimeout(done, 250))).then(() =>
          setLockIds(watchlist?.map((v) => parseInt(v)) || []),
        )
      }

      wasUsingWatchlist.current = true
    } else if (accountToCheck) {
      setLockIds([])
      mounted(getTokenLockersForAddress(getAddress(accountToCheck)))
        .then(setLockIds)
        .catch((err: Error) => {
          console.error(err)
          setLockIds([])
        })
      wasUsingWatchlist.current = false
    } else if (filterInputValue) {
      setLockIds([])
      if (isAddress(filterInputValue)) {
        mounted(getTokenLockersForAddress(getAddress(filterInputValue)))
          .then(setLockIds)
          .catch((err: Error) => {
            console.error(err)
            setLockIds([])
          })
      }
      wasUsingWatchlist.current = false
    } else {
      if (wasUsingWatchlist.current) {
        mounted(new Promise((done) => setTimeout(done, 250))).then(() =>
          setLockIds(new Array(tokenLockerCount).fill(null).map((val, index) => index)),
        )
      } else {
        setLockIds(new Array(tokenLockerCount).fill(null).map((val, index) => index))
      }

      wasUsingWatchlist.current = false
    }
  }, [
    chainId,
    mounted,
    contract,
    idToUse,
    // account,
    connector,
    accountToCheck,
    getTokenLockersForAddress,
    tokenLockerCount,
    filterInputValue,
    useWatchlist,
    watchlist,
  ])

  // useEffect(setupLocks, [setupLocks])

  useEffect(() => {
    setLockIds([])
    if (!chainId || !contract || !connector) return
    setupLockTimer.current && clearTimeout(setupLockTimer.current)
    mounted(
      new Promise((done) => {
        setupLockTimer.current = setTimeout(done, 250)
      }),
    ).then(setupLocks)
  }, [chainId, mounted, contract, connector, setupLocks])

  return (
    <Outer>
      <Header
        filterEnabled={idToUse || accountToCheck ? false : true}
        lockType={lockType}
        onFilterInput={setFilterInputValue}
      />

      <MidSection>
        <SectionInner>
          {connector ? (
            <div className="flex flex-col justify-center w-full items-center gap-4">
              {typeof idToUse !== 'undefined' &&
              typeof lockIds[0] !== 'undefined' &&
              parseInt(idToUse) === lockIds[0] ? (
                <div className="w-full md:max-w-md">
                  {chainId && chainIdToUse && chainId !== chainIdToUse ? (
                    <div className="text-center">
                      To view this lock, switch to{' '}
                      <SwitchNetworkButton targetNetwork={getNetworkDataByChainId(chainIdToUse)}></SwitchNetworkButton>{' '}
                    </div>
                  ) : (
                    <Lock key={lockIds[0]} lockId={lockIds[0]} lockType={lockType} />
                  )}
                </div>
              ) : lockIds.length === 0 ? (
                <LocksLoading>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <FontAwesomeIcon icon={faCircleNotch} fixedWidth spin className="opacity-50" size="5x" />
                  </motion.div>
                </LocksLoading>
              ) : (
                <Locks>
                  {/* copy and reverse ids to get descending order */}
                  {lockIds
                    .map((id) => id)
                    .reverse()
                    .map((lockId) => {
                      return <Lock key={lockId} lockId={lockId} lockType={lockType} />
                    })}
                </Locks>
              )}
            </div>
          ) : (
            <NotConnected text="Connect your wallet to view locks." />
          )}
        </SectionInner>
      </MidSection>
    </Outer>
  )
}

export default Locker
