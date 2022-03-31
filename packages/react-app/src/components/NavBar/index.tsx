import React, { useContext } from 'react'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'
import { Link } from 'react-router-dom'
import NetworkSelect from '../NetworkSelect'
import ConnectButton from '../ConnectButton'
// import { PriceTrackerContext } from '../contracts/PriceTracker'

import logoSrc from '../../images/logo-white.svg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import Button from '../Button'
import { AppNavState } from '../../App'

const Outer = tw.nav`
  h-16
  px-5
  md:px-10
  bg-gray-200
  dark:bg-gray-900
  text-gray-800
  dark:text-gray-100
  overflow-hidden
  fixed
  top-0
  left-0
  md:left-16
  right-0
  z-30
`

const Inner = tw.div`
  container
  m-auto
  w-full
  h-full
  flex
  justify-between
  items-center
`

const Left = tw.div``

const HeaderCSS = styled.h1`
  font-family: 'Rubik', Avenir, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
    'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
`

const Header = tw(HeaderCSS)`
  flex
  items-center
  gap-2
`

const LogoLinkCSS = styled(Link)``

const LogoLink = tw(LogoLinkCSS)`
  flex
  gap-3
  items-center
`

const LogoImgWrapperCSS = styled.span`
  transition: transform 0.5s;

  ${LogoLinkCSS}:hover & {
    transform: scale3d(1.2, 1.2, 1.2) rotateZ(270deg);
  }
`

const LogoImgWrapper = tw(LogoImgWrapperCSS)`
  bg-blue-500
  rounded-full
`

const LogoImgCSS = styled.img`
  transform: scale3d(1.6, 1.6, 1.6);
  transition: transform 0.5s;

  ${LogoLinkCSS}:hover & {
    transform: scale3d(1.5, 1.5, 1.5);
  }
`

const LogoImg = tw(LogoImgCSS)`
  pointer-events-none
  w-10
  h-10
`

const LogoText = tw.div`
  text-3xl
  uppercase
  hidden
  md:flex
  gap-1
  items-center
`

const Right = tw.div`
  flex
  items-center
`

// const RightLinks = tw.div`
//   flex
//   gap-4
//   items-center
// `

// const RightLink = tw(Link)`
//   text-lg
//   text-indigo-500
//   hover:text-indigo-400
//   dark:text-indigo-300
//   dark:hover:text-indigo-100
// `

const NavBar: React.FC = () => {
  const { leftNavExpanded, setLeftNavExpanded } = useContext(AppNavState)
  // const { nativeCoinPrice } = useContext(PriceTrackerContext) || {}

  return (
    <Outer>
      <Inner>
        <Left>
          <Header>
            <Button
              className="md:hidden"
              onClick={() => {
                setLeftNavExpanded(!leftNavExpanded)
              }}
            >
              <FontAwesomeIcon icon={faBars} />
            </Button>

            <LogoLink to="/">
              <LogoImgWrapper>
                <LogoImg src={logoSrc} width={36} height={36} />
              </LogoImgWrapper>

              <LogoText>
                <span className="font-light">Only</span>
                <span className="font-bold">Moons</span>
              </LogoText>
            </LogoLink>
          </Header>
        </Left>

        <Right>
          {/* <RightLinks>
            <RightLink to="/staking">Staking</RightLink>
            <RightLink to="/locker">Locker</RightLink>
          </RightLinks> */}

          {/* <DarkModeToggle /> */}

          {/* <span className="mx-4">
            ${(nativeCoinPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span> */}

          <NetworkSelect className="rounded-tr-none rounded-br-none" />
          <ConnectButton className="rounded-tl-none rounded-bl-none" />
        </Right>
      </Inner>
    </Outer>
  )
}

export default NavBar
