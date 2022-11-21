import React, { HTMLAttributes } from 'react'
// import { Link } from 'react-router-dom'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { faCheck, faInfoCircle, faRefresh } from '@fortawesome/free-solid-svg-icons'
import { useInView } from 'react-intersection-observer'
// import Tooltip from '../Tooltip'
import Anchor from '../Anchor'
import AngledSection from '../AngledSection'
import { motion } from 'framer-motion'
import { faGithub, faOsi } from '@fortawesome/free-brands-svg-icons'

const AboutContent = tw.div`
  flex
  justify-center
  max-w-5xl
  m-auto
`

// const AboutItem = tw.div`
//   p-2
//   flex
//   flex-col
//   w-full
//   m-auto
//   justify-start
//   items-center
//   h-full
//   text-center
// `

// const AboutItemHeader = tw.div`
//   text-3xl
//   font-bold
//   whitespace-nowrap
//   p-4
// `

// const AboutItemContent = tw.div`
//   text-lg
//   w-full
// `

const ContractInfo = tw.div`
  m-auto
  mt-24
  text-center
  flex
  flex-col
  items-center
  max-w-4xl
`

const ContractInfoSection = tw.div`
  bg-blue-200
  text-gray-900
  dark:bg-blue-900
  dark:text-gray-200
  rounded
  p-16
  w-full
  md:w-3/4
  mt-20
`

const ContractInfoSectionTitle = tw.h2`
  text-3xl
`

const ContractInfoSectionContent = tw.div`
  mt-5
  text-center
`

// const LinkCSS = styled(Link)`
//   color: black;
// `

// const LinkTailwind = tw(LinkCSS)`
//   dark:text-indigo-300
//   underline
// `

// const LiqLink = tw(LinkTailwind)`
//   text-lg
// `

const AnchorCSS = styled(Anchor)`
  color: black;
`

AnchorCSS.defaultProps = {
  target: '_blank',
  rel: 'noreferrer noopener',
}

const AnchorTailwind = tw(AnchorCSS)`
  dark:text-indigo-300
  underline
`

const AuditLink = tw(AnchorTailwind)`
  text-lg
`

// interface AboutItemComponentProps {
//   title: string
//   content: string
//   tip?: boolean
//   for?: string
// }

// const AboutItemComponent: React.FC<AboutItemComponentProps> = ({ title, content, tip, for: for_ }) => {
//   return (
//     <AboutItem data-tip={tip} data-for={for_}>
//       <AboutItemHeader>{title}</AboutItemHeader>
//       <AboutItemContent>{content}</AboutItemContent>
//     </AboutItem>
//   )
// }

const getDirectionToPixels = (direction: 'left' | 'right', amount: number = 20) => {
  return direction === 'left' ? -amount : amount
}

interface ContractInfoSectionComponentProps {
  direction: 'left' | 'right'
  icon?: IconDefinition
}

const ContractInfoSectionComponent: React.FC<ContractInfoSectionComponentProps & HTMLAttributes<HTMLDivElement>> = ({
  children,
  direction,
  icon,
  ...rest
}) => {
  const [ref, inView] = useInView({ delay: 250, triggerOnce: true })

  return (
    <motion.div
      ref={ref}
      className="w-full h-full flex justify-center"
      initial={{ opacity: 0, translateX: getDirectionToPixels(direction) }}
      animate={{ opacity: inView ? 1 : 0, translateX: inView ? 0 : getDirectionToPixels(direction) }}
      transition={{ duration: 0.5 }}
    >
      <ContractInfoSection {...rest}>
        <div className="">
          <div className=""></div>
          <div className="">{children}</div>
        </div>
      </ContractInfoSection>
    </motion.div>
  )
}

const About: React.FC = () => {
  return (
    <AngledSection>
      <AboutContent>{/* <AboutItemComponent title="Total supply" content="500,000,000" /> */}</AboutContent>

      <ContractInfo>
        <ContractInfoSectionComponent direction="right" style={{ marginTop: 0 }}>
          <ContractInfoSectionTitle>
            <FontAwesomeIcon icon={faRefresh} className="text-gray-500" /> Relaunched on Ethereum
          </ContractInfoSectionTitle>

          <ContractInfoSectionContent>
            <p>
              The OnlyMoons token was relaunched on the Ethereum network, for long-term security. Liquidity was moved
              from PancakeSwap to Uniswap V3.
            </p>

            <p className="mt-6 italic text-sm">Token address: 0x67be50aCd00883C9E85539b88aABE7697d607576</p>

            <p className="mt-6 italic text-sm">
              <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500" /> A 1:1 airdrop took place on November
              19th, 2022. If you received tokens on Ethereum, and do not have ether for gas, please don't hesitate to
              reach out.
            </p>
          </ContractInfoSectionContent>
        </ContractInfoSectionComponent>

        <ContractInfoSectionComponent direction="left">
          <ContractInfoSectionTitle>
            <FontAwesomeIcon icon={faCheck} className="text-green-500" /> Contracts audited
          </ContractInfoSectionTitle>

          <ContractInfoSectionContent>
            Audits were performed by Solidity Finance and can be viewed here:
            <br />
            <br />
            <AuditLink href="https://solidity.finance/audits/OnlyMoons/">OnlyMoons Token</AuditLink>
            <br />
            <AuditLink href="https://solidity.finance/audits/OnlyMoonsTokenLockerV1/">OnlyMoons Token Locker</AuditLink>
            <p className="mt-6 italic text-sm">
              <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500" /> Audits were performed when the token
              &amp; locker existed only on BSC. The Ethereum token and locker contracts are identical on all networks.
            </p>
          </ContractInfoSectionContent>
        </ContractInfoSectionComponent>

        <ContractInfoSectionComponent direction="right">
          <ContractInfoSectionTitle>
            <FontAwesomeIcon icon={faOsi} className="text-gray-500" /> Open source
          </ContractInfoSectionTitle>

          <ContractInfoSectionContent>
            <p>
              All code is licensed under open source licenses. Newer code uses GNU GPL v3, while some old code is
              licensed under MIT.
            </p>

            <p className="mt-6">
              We currently use{' '}
              <AnchorTailwind href="https://github.com/onlymoons-io/onlymoons">
                <FontAwesomeIcon icon={faGithub} /> GitHub
              </AnchorTailwind>{' '}
              to host the project repository.{' '}
            </p>
          </ContractInfoSectionContent>
        </ContractInfoSectionComponent>

        {/* <ContractInfoSectionComponent direction="left">
          <ContractInfoSectionTitle>
            <FontAwesomeIcon icon={faLock} className="text-gray-500" /> Liquidity locked
          </ContractInfoSectionTitle>

          <ContractInfoSectionContent>
            Liquidity is locked right here in our own <LinkTailwind to="/locker">locker</LinkTailwind>.
            <br />
            <br />
            <LiqLink to="/locker/56/1">PancakeSwap LP lock</LiqLink>
          </ContractInfoSectionContent>
        </ContractInfoSectionComponent> */}

        {/* <ContractInfoSectionComponent direction="left">
          <ContractInfoSectionTitle>
            <FontAwesomeIcon icon={faPeopleCarry} className="text-gray-500" /> No team wallet
          </ContractInfoSectionTitle>

          <ContractInfoSectionContent>
            No tokens were distributed to team wallets. Any tokens held by team members were purchased after launch.
          </ContractInfoSectionContent>
        </ContractInfoSectionComponent> */}
      </ContractInfo>
    </AngledSection>
  )
}

export default About
