import React from 'react'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'
import { Link } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core'
import AngledSection from '../AngledSection'
import Lock from './Lock'
import { Primary as PrimaryButton, Dark as DarkButton } from '../Button'
import Input from '../Input'

const Outer = tw.div`
  flex
  flex-col
  min-h-screen
`

const TopSectionCSS = styled.section``

const TopSection = tw(TopSectionCSS)`
  p-10
  pb-36
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

const Title = tw.h2`
  text-2xl
  font-extralight
`

const Locks = tw.div`
  grid
  grid-cols-1
  md:grid-cols-2
  xl:grid-cols-3
  2xl:grid-cols-4
  gap-5
`

const Locker: React.FC = () => {
  const { account } = useWeb3React()

  return (
    <Outer>
      <TopSection>
        <SectionInner>
          <Title>Token Locker V1</Title>

          <div className="my-2 flex flex-col md:flex-row items-start md:items-center gap-3">
            <div className="flex items-center gap-3">
              <PrimaryButton disabled={!account}>Create lock</PrimaryButton>

              {account ? (
                <Link to={`/locker/manage`}>
                  <DarkButton>Your locks</DarkButton>
                </Link>
              ) : (
                <DarkButton disabled={true}>Your locks</DarkButton>
              )}
            </div>

            <Input disabled={!account} placeholder="Filter by name or address" style={{ minWidth: '260px' }} />
          </div>
        </SectionInner>
      </TopSection>

      <AngledSection angle={0}>
        {account ? (
          <Locks>
            <Lock />
            <Lock />
            <Lock />
            <Lock />
            <Lock />
            <Lock />
            <Lock />
          </Locks>
        ) : (
          <>Please connect your wallet to view locks.</>
        )}
      </AngledSection>

      <BottomSection>
        <SectionInner>Footer</SectionInner>
      </BottomSection>
    </Outer>
  )
}

export default Locker
