import React from 'react'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'
import { motion } from 'framer-motion'
// import Tooltip from '../Tooltip'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTelegramPlane, faDiscord, faTwitter, faGithub } from '@fortawesome/free-brands-svg-icons'

import Anchor from '../Anchor'
import About from './About'

import logoSrc from '../../images/logo-white.svg'

const Outer = tw.div`
  w-full
  bg-gray-200
  dark:bg-gray-900
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
  text-gray-800
  dark:text-gray-200
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

MainAnchor.defaultProps = {
  target: '_blank',
  rel: 'noreferrer noopener',
}

const SocialLinkCSS = styled(Anchor)`
  transition: all 0.1s;
  color: #eee !important;
  opacity: 0.9;
  &:hover {
    opacity: 1;
    transform: scale(1.2);
  }
`

const SocialLink = tw(SocialLinkCSS)`
  text-xl
  p-2
  bg-blue-500
  dark:bg-blue-700
  flex
  justify-center
  items-center
  w-10
  h-10
  rounded-full
`

SocialLink.defaultProps = {
  target: '_blank',
  rel: 'noreferrer noopener',
}

// const scrollToElem = (elem: HTMLElement | null) => {
//   window.scrollTo(0, window.scrollY + (elem?.getBoundingClientRect().top || 0))
// }

const Home: React.FC = () => {
  return (
    <Outer>
      <HeroOuter>
        <HeroContent>
          <HeroSection>
            <Header>
              <em className="font-bold text-indigo-500">Open source</em>
              <br />
              EVM utility suite.
              {/* <span className="font-bold">Only</span>Moons */}
            </Header>

            {/* <Description>A community driven launchpad.</Description> */}

            <Links>
              <MainAnchor href="https://onlymoons.gitbook.io/">Documentation</MainAnchor>
            </Links>

            <Links>
              <SocialLink href="https://t.me/OnlyMoonsTeam" title="Telegram">
                <FontAwesomeIcon icon={faTelegramPlane} />
              </SocialLink>

              <SocialLink href="https://discord.gg/E8hXdpKenM" title="Discord">
                <FontAwesomeIcon icon={faDiscord} />
              </SocialLink>

              <SocialLink href="https://twitter.com/OnlyMoonsTeam" title="Twitter">
                <FontAwesomeIcon icon={faTwitter} />
              </SocialLink>

              <SocialLink href="https://github.com/onlymoons-io/onlymoons" title="GitHub">
                <FontAwesomeIcon icon={faGithub} />
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
      {/* <Roadmap /> */}
    </Outer>
  )
}

export default Home
