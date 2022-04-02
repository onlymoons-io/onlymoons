import React from 'react'
import { Link } from 'react-router-dom'
import tw from 'tailwind-styled-components'
import { useWeb3React } from '@web3-react/core'
import { useStakingManagerV1Contract } from '../contracts/StakingManagerV1'
import { Primary as PrimaryButton } from '../Button'

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
  const { owner } = useStakingManagerV1Contract()

  return (
    <TopSection>
      <SectionInner>
        <Title>
          <Link to="/staking">Staking</Link>
        </Title>

        <div className="my-2 flex flex-col md:flex-row justify-between items-start lg:items-center gap-3">
          <div className="grid grid-cols-2 w-full md:flex items-center gap-3">
            {owner && owner === account && (
              <Link to="/staking/create">
                <PrimaryButton className="w-full" disabled={!account}>
                  Create
                </PrimaryButton>
              </Link>
            )}

            {/* {account ? (
              <Link to={`/staking/account/${account}`}>
                <DarkButton className="w-full">Your staking</DarkButton>
              </Link>
            ) : (
              <DarkButton disabled={true}>Your staking</DarkButton>
            )} */}
          </div>

          {/* <Input
            disabled={!account || !filterEnabled}
            color="dark"
            placeholder="Filter by address"
            className="w-full md:w-auto"
            style={{ maxWidth: '100%' }}
            size={48}
            onInput={e => onFilterInput && onFilterInput(e.currentTarget.value)}
          /> */}
        </div>
      </SectionInner>
    </TopSection>
  )
}

export default Header
