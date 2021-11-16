import React from 'react'
import { Link } from 'react-router-dom'
import tw from 'tailwind-styled-components'
import { useWeb3React } from '@web3-react/core'
import { Primary as PrimaryButton, Dark as DarkButton } from '../Button'
import Input from '../Input'

const TopSection = tw.section`
  p-10
  bg-gray-900
`

const SectionInner = tw.div`
  container
  m-auto
  md:flex
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

        <div className="my-2 flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="flex items-center gap-3">
            <Link to="/locker/create">
              <PrimaryButton disabled={!account}>Create lock</PrimaryButton>
            </Link>

            {account ? (
              <Link to={`/locker/account/${account}`}>
                <DarkButton>Your locks</DarkButton>
              </Link>
            ) : (
              <DarkButton disabled={true}>Your locks</DarkButton>
            )}
          </div>

          <Input
            disabled={!account || !filterEnabled}
            color="dark"
            placeholder="Filter by address"
            style={{ minWidth: '260px' }}
            onInput={e => onFilterInput && onFilterInput(e.currentTarget.value)}
          />
        </div>
      </SectionInner>
    </TopSection>
  )
}

export default Header
