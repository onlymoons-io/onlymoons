import React, { useContext, useEffect, useState, useCallback } from 'react'
import tw from 'tailwind-styled-components'
import { useParams } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core'
import { utils } from 'ethers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion'
import { TokenLockerManagerV1ContractContext } from '../contracts/TokenLockerManagerV1'
import Lock from './Lock'
import NotConnected from '../NotConnected'
import { TokenLockData } from '../../typings'
import Header from './Header'

const { isAddress } = utils

const Outer = tw.div`
  
`

const MidSection = tw.section`
  bg-blue-500
  dark:bg-blue-900
  py-10
  px-5
  md:px-10
`

const BottomSection = tw.section`
  bg-blue-600
  dark:bg-gray-800
  py-10
  px-5
  md:px-10
  flex-grow
`

const SectionInner = tw.div`
  container
  m-auto
  md:flex
  justify-between
  items-center
`

const Locks = tw.div`
  grid
  grid-cols-1
  md:grid-cols-2
  xl:grid-cols-3
  2xl:grid-cols-4
  gap-5
  w-full
`

const LocksLoading = tw.div`
  flex
  justify-center
  items-center
  py-20
`

const Locker: React.FC = () => {
  const { account: accountToCheck, chainId: chainIdToUse, id: idToUse } = useParams()
  const { account, chainId } = useWeb3React()
  const { contract, getTokenLockersForAddress, getTokenLockData, tokenLockerCount } = useContext(
    TokenLockerManagerV1ContractContext,
  )
  const [tokenLocks, setTokenLocks] = useState<Array<TokenLockData>>([])
  const [sortedLocks, setSortedLocks] = useState<Array<TokenLockData>>([])
  const [filterInputValue, setFilterInputValue] = useState<string>()

  useEffect(() => {
    if (chainId && chainIdToUse && chainId !== parseInt(chainIdToUse)) {
      //
      console.warn('Incorrect chain id!')
    }
  }, [chainId, chainIdToUse])

  const setupLocks = useCallback(() => {
    if (!contract || !account || !tokenLockerCount || !getTokenLockData || !getTokenLockersForAddress) {
      setTokenLocks([])
      return
    }

    if (idToUse) {
      getTokenLockData(parseInt(idToUse))
        .then(result => setTokenLocks([result]))
        .catch(console.error)
    } else if (accountToCheck) {
      getTokenLockersForAddress(accountToCheck).then((ids: Array<number>) =>
        Promise.all(ids.map(id => getTokenLockData(id)))
          .then((results: Array<TokenLockData>) => setTokenLocks(results))
          .catch(console.error),
      )
    } else if (filterInputValue) {
      setTokenLocks([])
      if (isAddress(filterInputValue)) {
        getTokenLockersForAddress(filterInputValue).then((ids: Array<number>) =>
          Promise.all(ids.map(id => getTokenLockData(id)))
            .then((results: Array<TokenLockData>) => setTokenLocks(results))
            .catch(console.error),
        )
      }
    } else {
      Promise.all(new Array(tokenLockerCount).fill(null).map((val, index) => getTokenLockData(index)))
        .then((results: Array<TokenLockData>) => setTokenLocks(results))
        .catch(console.error)
    }
  }, [
    contract,
    idToUse,
    account,
    accountToCheck,
    getTokenLockData,
    getTokenLockersForAddress,
    tokenLockerCount,
    filterInputValue,
  ])

  useEffect(setupLocks, [setupLocks])

  useEffect(() => {
    setSortedLocks(
      [...tokenLocks].sort(
        //
        (a, b) => (a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0),
      ),
    )
  }, [tokenLocks])

  return (
    <Outer>
      <Header filterEnabled={idToUse || accountToCheck ? false : true} onFilterInput={setFilterInputValue} />

      <MidSection>
        <SectionInner>
          {account ? (
            <div className="flex flex-col justify-center w-full items-center gap-4">
              {typeof idToUse !== 'undefined' && sortedLocks[0] && parseInt(idToUse) === sortedLocks[0].id ? (
                <div className="w-full md:max-w-md">
                  <Lock key={sortedLocks[0].contractAddress} lock={sortedLocks[0]} />
                </div>
              ) : sortedLocks.length === 0 ? (
                <LocksLoading>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <FontAwesomeIcon icon={faCircleNotch} fixedWidth spin className="opacity-50" size="5x" />
                  </motion.div>
                </LocksLoading>
              ) : (
                <Locks>
                  {sortedLocks.map((lock: TokenLockData) => (
                    <Lock key={lock.contractAddress} lock={lock} />
                  ))}
                </Locks>
              )}
            </div>
          ) : (
            <NotConnected text="Connect your wallet to view locks." />
          )}
        </SectionInner>
      </MidSection>

      <BottomSection>
        <SectionInner></SectionInner>
      </BottomSection>
    </Outer>
  )
}

export default Locker
