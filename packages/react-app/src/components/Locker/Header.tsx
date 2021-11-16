import React from 'react'
import { Link } from 'react-router-dom'
import tw from 'tailwind-styled-components'
import { useWeb3React } from '@web3-react/core'
import { Primary as PrimaryButton, Dark as DarkButton } from '../Button'
import Input from '../Input'

const TopSection = tw.section`
  py-10
  px-5
  md:px-10
  bg-gray-900
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
`

interface Props {
  filterEnabled?: boolean
  onFilterInput?: (value: string) => void
}

const Header: React.FC<Props> = ({ filterEnabled = true, onFilterInput }) => {
  const { account } = useWeb3React()

  return (
    <TopSection>
      <SectionInner>
        <Title>
          <Link to="/locker">Token Locker V1</Link>
        </Title>

        <div className="my-2 flex flex-col md:flex-row justify-between items-start lg:items-center gap-3">
          <div className="grid grid-cols-2 w-full md:flex items-center gap-3">
            <Link to="/locker/create">
              <PrimaryButton className="w-full" disabled={!account}>
                Create lock
              </PrimaryButton>
            </Link>

            {account ? (
              <Link to={`/locker/account/${account}`}>
                <DarkButton className="w-full">Your locks</DarkButton>
              </Link>
            ) : (
              <DarkButton disabled={true}>Your locks</DarkButton>
            )}
          </div>

          <Input
            disabled={!account || !filterEnabled}
            color="dark"
            placeholder="Filter by address"
            className="w-full md:w-auto"
            style={{ maxWidth: '100%' }}
            size={48}
            onInput={e => onFilterInput && onFilterInput(e.currentTarget.value)}
          />
        </div>
      </SectionInner>
    </TopSection>
  )
}

export default Header
