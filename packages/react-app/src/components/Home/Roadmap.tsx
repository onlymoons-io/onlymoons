import React from 'react'
// import styled from 'styled-components'
import tw from 'tailwind-styled-components'
// import Anchor from '../Anchor'

const Outer = tw.footer`
  bg-blue-600
  py-10
`

const Inner = tw.div`
  p-10
  m-auto
  flex
  flex-col
  justify-center
  items-center
  max-w-4xl
`

const Header = tw.h2`
  text-3xl
`

const Content = tw.div`
  mt-8
  w-full
`

const RoadmapSection = tw.div`
  py-10
  flex
  flex-col
  md:flex-row
  justify-between
  items-center
  gap-20
`

const RoadmapSectionTitle = tw.div`
  text-3xl
  font-bold
  md:w-1/2
  text-right
`

const RoadmapSectionContent = tw.div`
  md:w-1/2
`

const Roadmap: React.FC = () => {
  return (
    <Outer id="roadmap">
      <Inner>
        <Header>Roadmap</Header>

        <Content>
          <RoadmapSection>
            <RoadmapSectionTitle>Q4 2021</RoadmapSectionTitle>

            <RoadmapSectionContent>
              <ul className="list-disc">
                <li style={{ textDecoration: 'line-through' }}>Launch token on Pancakeswap</li>
                <li style={{ textDecoration: 'line-through' }}>Launch website</li>
                <li>Begin development of launchpad platform</li>
                <li>Marketing campaign</li>
              </ul>
            </RoadmapSectionContent>
          </RoadmapSection>
        </Content>
      </Inner>
    </Outer>
  )
}

export default Roadmap
