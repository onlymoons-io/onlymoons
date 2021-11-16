import React from 'react'
// import { Link } from 'react-router-dom'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'
import { motion } from 'framer-motion'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTelegramPlane,
  faDiscord,
  faTwitter,
  faTwitch,
  faInstagram,
  faReddit,
} from '@fortawesome/free-brands-svg-icons'

import Anchor from '../Anchor'
import About from './About'
// import Contract from './Contract'
import Roadmap from './Roadmap'

import logoSrc from '../../images/logo-white.svg'

const Outer = tw.div`
  w-full
  bg-gray-900
`

const HeroOuter = tw.div`
  container
  m-auto
  h-screen
  flex
  justify-center
  items-center
  py-10
  px-5
  md:px-10
  -mt-16
`

const HeroContent = tw.div`
  flex
  flex-col
  md:flex-row
  justify-between
  items-center
  w-full
  max-w-screen-lg
  mx-6
`

const HeroSection = tw.div`
  flex-grow
  md:w-1/2
  py-8
`

const Header = tw.h1`
  text-5xl
  text-gray-200
  text-center
  md:text-left
`

const Links = tw.div`
  flex
  gap-3
  justify-center
  md:justify-start
  items-center
  mt-4
`

const MainAnchor = tw(Anchor)`
  text-2xl
`

const SocialLinkCSS = styled(Anchor)`
  transition: all 0.1s;
  &:hover {
    transform: scale(1.2);
  }
`

const SocialLink = tw(SocialLinkCSS)`
  text-xl
  p-2
  bg-blue-700
  flex
  justify-center
  items-center
  w-10
  h-10
  rounded-full
`

const scrollToElem = (elem: HTMLElement | null) => {
  window.scrollTo(0, window.scrollY + (elem?.getBoundingClientRect().top || 0))
}

const Home: React.FC = () => {
  return (
    <Outer>
      <HeroOuter>
        <HeroContent>
          <HeroSection>
            <Header>
              A community driven launchpad.
              {/* <span className="font-bold">Only</span>Moons */}
            </Header>

            {/* <Description>A community driven launchpad.</Description> */}

            <Links>
              <MainAnchor
                target="_blank"
                rel="noreferrer noopener"
                href="https://pancakeswap.finance/swap?outputCurrency=0x1b3d161e0696e5688e0207a182bc5fa48fd0815d"
              >
                Buy
              </MainAnchor>

              <MainAnchor
                target="_blank"
                rel="noreferrer noopener"
                href="https://www.dextools.io/app/bsc/pair-explorer/0xea03d63fad4c799e3868902bff689fd44ccdd21f"
              >
                Chart
              </MainAnchor>

              <MainAnchor
                href="#roadmap"
                onClick={e => {
                  e.preventDefault()
                  scrollToElem(document.getElementById('roadmap'))
                }}
              >
                Roadmap
              </MainAnchor>
            </Links>

            <Links>
              <SocialLink target="_blank" rel="noreferrer noopener" href="https://t.me/OnlyMoonsTeam" title="Telegram">
                <FontAwesomeIcon icon={faTelegramPlane} />
              </SocialLink>

              <SocialLink
                target="_blank"
                rel="noreferrer noopener"
                href="https://discord.gg/E8hXdpKenM"
                title="Discord"
              >
                <FontAwesomeIcon icon={faDiscord} />
              </SocialLink>

              <SocialLink
                target="_blank"
                rel="noreferrer noopener"
                href="https://twitter.com/OnlyMoonsTeam"
                title="Twitter"
              >
                <FontAwesomeIcon icon={faTwitter} />
              </SocialLink>

              <SocialLink
                target="_blank"
                rel="noreferrer noopener"
                href="https://www.twitch.tv/onlymoonsofficial"
                title="Twitch"
              >
                <FontAwesomeIcon icon={faTwitch} />
              </SocialLink>

              <SocialLink
                target="_blank"
                rel="noreferrer noopener"
                href="https://www.instagram.com/onlymoonsteam/"
                title="Instagram"
              >
                <FontAwesomeIcon icon={faInstagram} />
              </SocialLink>

              <SocialLink
                target="_blank"
                rel="noreferrer noopener"
                href="https://www.reddit.com/r/OnlyMoonsCommunity/"
                title="Reddit"
              >
                <FontAwesomeIcon icon={faReddit} />
              </SocialLink>
            </Links>
          </HeroSection>

          {/* moon logo section */}
          <HeroSection className="flex justify-end">
            <motion.div initial={{ translateY: 20 }} animate={{ translateY: 0 }} transition={{ duration: 1 }}>
              <motion.img
                className="w-96 h-96 bg-blue-500 rounded-full object-cover pointer-events-none"
                src={logoSrc}
                style={{ maxWidth: '30vw', maxHeight: '30vw' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              />
            </motion.div>
          </HeroSection>
        </HeroContent>
      </HeroOuter>

      <About />
      {/* <Contract /> */}
      <Roadmap />
    </Outer>
  )
}

export default Home
