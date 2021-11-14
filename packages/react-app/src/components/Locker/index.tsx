import React, { useContext, useEffect, useState, useCallback } from 'react'
import tw from 'tailwind-styled-components'
import { useParams } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core'
import { TokenLockerManagerV1ContractContext } from '../contracts/TokenLockerManagerV1'
import Lock from './Lock'
import NotConnected from '../NotConnected'
import { TokenLockData } from '../../typings'
import Header from './Header'

const Outer = tw.div`
  
`

const MidSection = tw.section`
  bg-blue-500
  p-10
`

const BottomSection = tw.section`
  bg-blue-600
  p-10
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

const Locker: React.FC = () => {
  const { account: accountToCheck, chainId: chainIdToUse, id: idToUse } = useParams()
  const { account, chainId } = useWeb3React()
  const { contract, getTokenLockersForAccount, getTokenLockData, tokenLockerCount } = useContext(
    TokenLockerManagerV1ContractContext,
  )
  const [tokenLocks, setTokenLocks] = useState<Array<TokenLockData>>([])
  const [sortedLocks, setSortedLocks] = useState<Array<TokenLockData>>([])

  useEffect(() => {
    if (chainId && chainIdToUse && chainId !== parseInt(chainIdToUse)) {
      //
      console.warn('Incorrect chain id!')
    }
  }, [chainId, chainIdToUse])

  const setupLocks = useCallback(() => {
    if (!contract || !account || !tokenLockerCount || !getTokenLockData || !getTokenLockersForAccount) {
      setTokenLocks([])
      return
    }

    if (idToUse) {
      getTokenLockData(parseInt(idToUse))
        .then(result => setTokenLocks([result]))
        .catch(console.error)
    } else if (accountToCheck) {
      getTokenLockersForAccount(accountToCheck).then((ids: Array<number>) =>
        Promise.all(ids.map(id => getTokenLockData(id)))
          .then((results: Array<TokenLockData>) => setTokenLocks(results))
          .catch(console.error),
      )
    } else {
      Promise.all(new Array(tokenLockerCount).fill(null).map((val, index) => getTokenLockData(index)))
        .then((results: Array<TokenLockData>) => setTokenLocks(results))
        .catch(console.error)
    }
  }, [contract, idToUse, account, accountToCheck, getTokenLockData, getTokenLockersForAccount, tokenLockerCount])

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
      <Header filterEnabled={idToUse ? false : true} />

      <MidSection>
        <SectionInner>
          {account ? (
            <div className="flex flex-col justify-center w-full items-center gap-4">
              {idToUse && sortedLocks[0] ? (
                <div className="w-full md:max-w-md">
                  <Lock key={sortedLocks[0].address} lock={sortedLocks[0]} />
                </div>
              ) : (
                <Locks>
                  {sortedLocks.map((lock: TokenLockData) => (
                    <Lock key={lock.address} lock={lock} />
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
