import React from 'react'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'
import { Link } from 'react-router-dom'
import ConnectButton from '../ConnectButton'

import logoSrc from '../../images/logo-white.svg'

const Outer = tw.nav`
  z-10
  h-16
  px-5
  md:px-10
  bg-gray-900
  overflow-hidden
  fixed
  w-full
  top-0
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

const Header = tw(HeaderCSS)``

const LogoLinkCSS = styled(Link)``

const LogoLink = tw(LogoLinkCSS)`
  flex
  gap-3
  items-center
`

const LogoImgCSS = styled.img`
  transform: scale3d(2.25, 2.25, 2.25);
  transition: transform 0.5s;
  ${LogoLinkCSS}:hover & {
    transform: scale3d(2.5, 2.5, 2.5) rotateZ(270deg);
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
  gap-4
  items-center
`

const RightLinks = tw.div`
  flex
  gap-4
  items-center
`

const RightLink = tw(Link)`
  text-lg
  text-indigo-300
  hover:text-indigo-100
`

const NavBar: React.FC = () => {
  return (
    <Outer>
      <Inner>
        <Left>
          <Header>
            <LogoLink to="/">
              <LogoImg src={logoSrc} width={36} height={36} />

              <LogoText>
                <span className="font-light mr-1">Only</span>
                <span className="font-bold">Moons</span>
              </LogoText>
            </LogoLink>
          </Header>
        </Left>

        <Right>
          <RightLinks>
            {/* <RightLink to="/launches">Launches</RightLink> */}
            <RightLink to="/locker">Locker</RightLink>
          </RightLinks>

          <ConnectButton />
        </Right>
      </Inner>
    </Outer>
  )
}

export default NavBar
