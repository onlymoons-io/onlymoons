import React, { useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core'
import { utils } from 'ethers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion'
import { TokenLockerManagerV1ContractContext } from '../contracts/TokenLockerManagerV1'
import Lock from './Lock'
import NotConnected from '../NotConnected'
import Header from './Header'
import { Outer, MidSection, SectionInner, Grid as Locks, Loading as LocksLoading } from '../Layout'
import { usePromise } from 'react-use'
import { LockWatchlist } from './LockWatchlist'

const { isAddress, getAddress } = utils

export interface LockerProps {
  useWatchlist?: boolean
}

const Locker: React.FC<LockerProps> = ({ useWatchlist = false }) => {
  const { watchlist } = useContext(LockWatchlist)
  const mounted = usePromise()
  const { account: accountToCheck, chainId: chainIdToUse, id: idToUse } = useParams()
  const { chainId, connector } = useWeb3React()
  const { contract, getTokenLockersForAddress, tokenLockerCount } = useContext(TokenLockerManagerV1ContractContext)
  const [filterInputValue, setFilterInputValue] = useState<string>()
  const [lockIds, setLockIds] = useState<number[]>([])
  const wasUsingWatchlist = useRef<boolean>(false)
  const setupLockTimer = useRef<NodeJS.Timeout>()

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
        setLockIds(watchlist?.map(v => parseInt(v)) || [])
      } else {
        setLockIds([])
        mounted(new Promise(done => setTimeout(done, 250))).then(() =>
          setLockIds(watchlist?.map(v => parseInt(v)) || []),
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
        mounted(new Promise(done => setTimeout(done, 250))).then(() =>
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
      new Promise(done => {
        setupLockTimer.current = setTimeout(done, 250)
      }),
    ).then(setupLocks)
  }, [chainId, mounted, contract, connector, setupLocks])

  return (
    <Outer>
      <Header filterEnabled={idToUse || accountToCheck ? false : true} onFilterInput={setFilterInputValue} />

      <MidSection>
        <SectionInner>
          {connector ? (
            <div className="flex flex-col justify-center w-full items-center gap-4">
              {typeof idToUse !== 'undefined' && lockIds[0] && parseInt(idToUse) === lockIds[0] ? (
                <div className="w-full md:max-w-md">
                  {chainId && chainIdToUse && chainId !== parseInt(chainIdToUse) ? (
                    <div className="text-center">Connected to the wrong network to view this lock.</div>
                  ) : (
                    <Lock key={lockIds[0]} lockId={lockIds[0]} />
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
                    .map(id => id)
                    .reverse()
                    .map(lockId => {
                      return <Lock key={lockId} lockId={lockId} />
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
