import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import tw from 'tailwind-styled-components'
import { useWeb3React, getWeb3ReactContext } from '@web3-react/core'
import Button, { Primary as PrimaryButton, Light as LightButton } from '../Button'
import Input from '../Input'
import { useContractCache } from '../contracts/ContractCache'
import Anchor from '../Anchor'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { getExplorerContractLink } from '../../util'
import { usePromise } from 'react-use'
// import { LockWatchlist } from './LockWatchlist'

const TopSection = tw.section`
  py-10
  px-5
  md:px-10
  bg-gray-200
  text-gray-800
  dark:bg-gray-900
  dark:text-gray-200
`

const SectionInner = tw.div`
  container
  m-auto
  lg:flex
  justify-between
  items-center
`

const Title = tw.h2`
  text-2xl
  font-extralight
  flex
  gap-2
  items-center
`

interface Props {
  filterEnabled?: boolean
  lockType?: number
  onFilterInput?: (value: string) => void
}

const Header: React.FC<Props> = ({ filterEnabled = true, lockType = 1, onFilterInput }) => {
  const mounted = usePromise()
  const { pathname } = useLocation()
  const { account, chainId } = useWeb3React()
  const { chainId: constantChainId } = useContext(getWeb3ReactContext('constant') as React.Context<any>)
  const { getContract } = useContractCache()
  // const { watchlist } = useContext(LockWatchlist)
  const [address, setAddress] = useState<string>()

  const eitherChainId = typeof chainId !== 'undefined' ? chainId : constantChainId

  const getContractName = useCallback(() => {
    switch (lockType) {
      case 1:
      default:
        return 'TokenLockerManagerV1'
      case 2:
        return 'TokenLockerUniV2'
      case 3:
        return 'TokenLockerUniV3'
    }
  }, [lockType])

  useEffect(() => {
    mounted(getContract(getContractName()))
      .then((contract) => setAddress(contract?.address))
      .catch((err: Error) => {
        console.error(err)
        setAddress(undefined)
      })
  }, [mounted, getContract, getContractName])

  return (
    <>
      <div className="bg-gray-200 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-800 p-2 flex justify-center items-center">
        <Link to="/locker/2">
          <Button
            className={`rounded-l-none rounded-r-none border-b-2 ${
              pathname.startsWith('/locker/2')
                ? 'text-indigo-600 dark:text-indigo-400 border-indigo-400'
                : 'text-gray-600 dark:text-gray-400 border-transparent'
            }`}
            // onClick={() => setViewMode('all')}
          >
            UniV2 LP
          </Button>
        </Link>

        <Link to="/locker/3">
          <Button
            className={`rounded-l-none rounded-r-none border-b-2 ${
              pathname.startsWith('/locker/3')
                ? 'text-indigo-600 dark:text-indigo-400 border-indigo-400'
                : 'text-gray-600 dark:text-gray-400 border-transparent'
            }`}
            // onClick={() => setViewMode('all')}
          >
            UniV3 LP
          </Button>
        </Link>

        <Link to="/locker">
          <Button
            className={`rounded-l-none rounded-r-none border-b-2 ${
              pathname.startsWith('/locker') && !(pathname.startsWith('/locker/2') || pathname.startsWith('/locker/3'))
                ? 'text-indigo-600 dark:text-indigo-400 border-indigo-400'
                : 'text-gray-600 dark:text-gray-400 border-transparent'
            }`}
            // onClick={() => setViewMode('split')}
          >
            Legacy V1
          </Button>
        </Link>
      </div>

      <TopSection>
        <SectionInner>
          <Title>
            <Link to={!lockType || lockType === 1 ? '/locker' : `/locker/${lockType}`}>
              {lockType === 1
                ? 'Token Locker V1'
                : lockType === 2
                ? 'UniV2 LP Locker'
                : lockType === 3
                ? 'UniV3 LP Locker'
                : 'Locker?'}
            </Link>
            {eitherChainId && address && (
              <Anchor target="_blank" rel="noopener noreferrer" href={getExplorerContractLink(eitherChainId, address)}>
                <FontAwesomeIcon icon={faExternalLinkAlt} fixedWidth />
              </Anchor>
            )}
          </Title>

          <div className="my-2 flex flex-col md:flex-row justify-between items-start lg:items-center gap-3">
            <div className="grid grid-cols-2 w-full md:flex items-center gap-3">
              <Link to={`/locker${!lockType || lockType === 1 ? '' : `/${lockType}`}/create`}>
                <PrimaryButton className="w-full" disabled={!account}>
                  Create lock
                </PrimaryButton>
              </Link>

              {account ? (
                <Link to={`/locker${!lockType || lockType === 1 ? '' : `/${lockType}`}/search/${account}`}>
                  <LightButton className="w-full">Your locks</LightButton>
                </Link>
              ) : (
                <LightButton disabled={true}>Your locks</LightButton>
              )}

              {/* {eitherChainId ? (
              <Link to={`/locker${!lockType || lockType === 1 ? '' : `/${lockType}`}/watchlist`}>
                <LightButton className="w-full">Watchlist ({(watchlist || []).length})</LightButton>
              </Link>
            ) : (
              <LightButton disabled={true}>Watchlist</LightButton>
            )} */}
            </div>

            <Input
              disabled={!eitherChainId || !filterEnabled}
              color="dark"
              placeholder="Filter by address"
              className="w-full md:w-auto"
              style={{ maxWidth: '100%' }}
              size={48}
              onInput={(e) => onFilterInput && onFilterInput(e.currentTarget.value)}
            />
          </div>
        </SectionInner>
      </TopSection>
    </>
  )
}

export default Header
