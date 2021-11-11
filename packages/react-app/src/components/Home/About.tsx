import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'
// import { faLock } from '@fortawesome/free-solid-svg-icons'
import { useInView } from 'react-intersection-observer'
import ReactTooltip from 'react-tooltip'
import Anchor from '../Anchor'
import AngledSection from '../AngledSection'
import { motion } from 'framer-motion'

const AboutContent = tw.div`
  grid md:grid-cols-2 lg:grid-cols-4 gap-4
`

const AboutItem = tw.div`
  p-2
  flex
  flex-col
  w-full
  m-auto
  justify-start
  items-center
  h-full
  text-center
`

const AboutItemHeader = tw.div`
  text-3xl
  font-bold
  whitespace-nowrap
  p-4
`

const AboutItemContent = tw.div`
  text-lg
  w-full
`

const ContractInfo = tw.div`
  m-auto
  mt-24
  text-center
  px-10
  flex
  flex-col
  items-center
`

const ContractInfoSection = tw.div`
  bg-blue-200
  text-gray-900
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

const BlackLink = styled(Anchor)`
  color: black !important;
  text-decoration: underline;
`

interface AboutItemComponentProps {
  title: string
  content: string
  tip?: boolean
  for?: string
}

const AboutItemComponent: React.FC<AboutItemComponentProps> = ({ title, content, tip, for: for_ }) => {
  return (
    <AboutItem data-tip={tip} data-for={for_}>
      <AboutItemHeader>{title}</AboutItemHeader>
      <AboutItemContent>{content}</AboutItemContent>
    </AboutItem>
  )
}

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
      <AboutContent>
        <AboutItemComponent title="Total supply" content="1,000,000,000,000" />
        <>
          <AboutItemComponent title="Burned" content="54% ⓘ" tip={true} for="burned" />
          <ReactTooltip id="burned" type="dark" effect="solid" offset={{ top: -10 }}>
            44% in a traditional 0x00 dead wallet, with an additional
            <br />
            10% permanently locked in the token contract.
          </ReactTooltip>
        </>
        <AboutItemComponent title="Reflection rate" content="3% per transaction" />
        <AboutItemComponent title="Burn rate" content="3% per transaction" />
      </AboutContent>

      <ContractInfo>
        <ContractInfoSectionComponent direction="right" style={{ marginTop: 0 }}>
          <ContractInfoSectionTitle>Liquidity locked</ContractInfoSectionTitle>

          <ContractInfoSectionContent>
            Initial LP tokens were burned.
            <br />
            <br />
            Additional liquidity was added and locked post-launch.
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <BlackLink
                href="https://bscscan.com/token/0xea03d63fad4c799e3868902bff689fd44ccdd21f#balances"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg"
              >
                BscScan
              </BlackLink>
              <BlackLink
                href="https://dxsale.app/app/v3/dxlockview?id=0&add=0x8aBE50bDc089D381c68CE65EF9554D911c7CC403&type=lplock&chain=BSC"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg"
              >
                DXSale Lock
              </BlackLink>
            </div>
          </ContractInfoSectionContent>
        </ContractInfoSectionComponent>

        <ContractInfoSectionComponent direction="left">
          <ContractInfoSectionTitle>No team wallet</ContractInfoSectionTitle>

          <ContractInfoSectionContent>
            No tokens were distributed to team wallets. Any tokens held by team members were purchased after launch.
          </ContractInfoSectionContent>
        </ContractInfoSectionComponent>
      </ContractInfo>
    </AngledSection>
  )
}

export default About
