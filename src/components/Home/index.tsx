import React from 'react'
// import { Link } from 'react-router-dom'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'
import { motion } from 'framer-motion'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTelegramPlane, faDiscord, faTwitter, faFacebookF, faInstagram } from '@fortawesome/free-brands-svg-icons'

import Anchor from '../Anchor'

import About from './About'
// import Contract from './Contract'
import Roadmap from './Roadmap'

const Outer = tw.div`
  w-full
`

const HeroOuter = tw.div`
  container
  m-auto
  h-screen
  flex
  justify-center
  items-center
  p-10
`

const HeroContent = tw.div`
  flex
  flex-col
  md:flex-row
  justify-between
  items-center
  w-full
`

const HeroSection = tw.div`
  flex-grow
  md:w-1/2
  p-8
`

const Header = tw.h1`
  text-6xl
  text-gray-200
  text-center
  md:text-left
`

const Description = tw.div`
  mt-4
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

// const MainLink = tw(Link)`
//   text-indigo-300
//   hover:text-indigo-200
//   text-2xl
// `

// const Socials = tw.div`
//   flex
//   gap-3
//   justify-center
//   md:justify-start
//   items-center
//   mt-4
// `

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
            <Header>OnlyMoons</Header>

            <Description>A community driven launchpad.</Description>

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
                onClick={(e) => {
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

              <SocialLink target="_blank" rel="noreferrer noopener" href="/" title="Twitter">
                <FontAwesomeIcon icon={faTwitter} />
              </SocialLink>

              <SocialLink target="_blank" rel="noreferrer noopener" href="/" title="Facebook">
                <FontAwesomeIcon icon={faFacebookF} />
              </SocialLink>

              <SocialLink target="_blank" rel="noreferrer noopener" href="/" title="Instagram">
                <FontAwesomeIcon icon={faInstagram} />
              </SocialLink>
            </Links>
          </HeroSection>

          <HeroSection className="text-center">
            <motion.div
              className="bg-gray-100 w-96 h-96 rounded-full m-auto"
              style={{ maxWidth: '30vw', maxHeight: '30vw' }}
              initial={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 1 }}
            />
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
