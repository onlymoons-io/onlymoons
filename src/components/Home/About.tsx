import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'
import { useInView } from 'react-intersection-observer'
import Anchor from '../Anchor'
import { motion } from 'framer-motion'

const OuterCSS = styled.section`
  min-height: 320px;
`

const Outer = tw(OuterCSS)`
  relative
  bg-blue-500
  pb-16
`

const Angled = tw.div`
  h-xl
  w-full
  flex
  justify-center
  overflow-hidden
  z-0
`

const AngledInnerCSS = styled.div`
  height: 150px;
  width: 150%;
  top: -80px;
  transform: rotateZ(-3deg);
  overflow: hidden;
`

const AngledInner = tw(AngledInnerCSS)`
  absolute
  bg-blue-500
`

const InnerCSS = styled.div`
  min-height: 320px;
`

const Inner = tw(InnerCSS)`
  relative
  z-1
  w-full
  max-w-4xl
  m-auto
  flex
  flex-col
  py-10
`

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

const Content = tw.div`
  m-auto
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

interface AboutItemComponentProps {
  title: string
  content: string
}

const AboutItemComponent: React.FC<AboutItemComponentProps> = ({ title, content }) => {
  return (
    <AboutItem>
      <AboutItemHeader>{title}</AboutItemHeader>
      <AboutItemContent>{content}</AboutItemContent>
    </AboutItem>
  )
}

interface ContractInfoSectionComponentProps {
  direction: 'left' | 'right'
}

const getDirectionToPixels = (direction: 'left' | 'right', amount: number = 20) => {
  return direction === 'left' ? -amount : amount
}

const ContractInfoSectionComponent: React.FC<ContractInfoSectionComponentProps & HTMLAttributes<HTMLDivElement>> = ({
  children,
  direction,
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
      <ContractInfoSection {...rest}>{children}</ContractInfoSection>
    </motion.div>
  )
}

const About: React.FC = () => {
  return (
    <Outer>
      <Angled>
        <AngledInner />
      </Angled>
      <Inner>
        <Content>
          <AboutContent>
            <AboutItemComponent title="Total supply" content="1,000,000,000,000" />
            <AboutItemComponent title="Burned" content="54%" />
            <AboutItemComponent title="Reflection rate" content="3% per transaction" />
            <AboutItemComponent title="Burn rate" content="3% per transaction" />
          </AboutContent>

          <ContractInfo>
            <ContractInfoSectionComponent direction="right" style={{ marginTop: 0 }}>
              <ContractInfoSectionTitle>Liquidity locked</ContractInfoSectionTitle>

              <ContractInfoSectionContent>
                Initial liquidity was burned.
                <br />
                <br />
                Additional liquidity was added and locked post-launch.
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                  <Anchor
                    href="https://bscscan.com/token/0xea03d63fad4c799e3868902bff689fd44ccdd21f#balances"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'black' }}
                    className="text-lg"
                  >
                    BscScan
                  </Anchor>
                  <Anchor
                    href="https://dxsale.app/app/v3/dxlockview?id=0&add=0x8aBE50bDc089D381c68CE65EF9554D911c7CC403&type=lplock&chain=BSC"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'black' }}
                    className="text-lg"
                  >
                    DXSale Lock
                  </Anchor>
                </div>
              </ContractInfoSectionContent>
            </ContractInfoSectionComponent>

            <ContractInfoSectionComponent direction="left">
              <ContractInfoSectionTitle>No team wallet</ContractInfoSectionTitle>

              <ContractInfoSectionContent>
                No tokens were distributed to team wallets. Any tokens held by team members were purchased fairly after
                launch.
              </ContractInfoSectionContent>
            </ContractInfoSectionComponent>
          </ContractInfo>
        </Content>
      </Inner>
    </Outer>
  )
}

export default About
