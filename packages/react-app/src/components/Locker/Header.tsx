import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import tw from 'tailwind-styled-components'
import { useWeb3React, getWeb3ReactContext } from '@web3-react/core'
import { Primary as PrimaryButton, Light as LightButton } from '../Button'
import Input from '../Input'
import { useContractCache } from '../contracts/ContractCache'
import Anchor from '../Anchor'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { getExplorerContractLink } from '../../util'
import { usePromise } from 'react-use'
import { LockWatchlist } from './LockWatchlist'

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
  onFilterInput?: (value: string) => void
}

const Header: React.FC<Props> = ({ filterEnabled = true, onFilterInput }) => {
  const mounted = usePromise()
  const { account, chainId } = useWeb3React()
  const { chainId: constantChainId } = useContext(getWeb3ReactContext('constant'))
  const { getContract } = useContractCache()
  const { watchlist } = useContext(LockWatchlist)
  const [address, setAddress] = useState<string>()

  const eitherChainId = typeof chainId !== 'undefined' ? chainId : constantChainId

  useEffect(() => {
    mounted(getContract('TokenLockerManagerV1'))
      .then((contract) => setAddress(contract?.address))
      .catch((err: Error) => {
        console.error(err)
        setAddress(undefined)
      })
  }, [mounted, getContract])

  return (
    <TopSection>
      <SectionInner>
        <Title>
          <Link to="/locker">Token Locker V1</Link>
          {eitherChainId && address && (
            <Anchor target="_blank" rel="noopener noreferrer" href={getExplorerContractLink(eitherChainId, address)}>
              <FontAwesomeIcon icon={faExternalLinkAlt} fixedWidth />
            </Anchor>
          )}
        </Title>

        <div className="my-2 flex flex-col md:flex-row justify-between items-start lg:items-center gap-3">
          <div className="grid grid-cols-2 w-full md:flex items-center gap-3">
            <Link to="/locker/create">
              <PrimaryButton className="w-full" disabled={!account}>
                Create lock
              </PrimaryButton>
            </Link>

            {account ? (
              <Link to={`/locker/search/${account}`}>
                <LightButton className="w-full">Your locks</LightButton>
              </Link>
            ) : (
              <LightButton disabled={true}>Your locks</LightButton>
            )}

            {eitherChainId ? (
              <Link to={`/locker/watchlist`}>
                <LightButton className="w-full">Watchlist ({(watchlist || []).length})</LightButton>
              </Link>
            ) : (
              <LightButton disabled={true}>Watchlist</LightButton>
            )}
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
  )
}

export default Header
