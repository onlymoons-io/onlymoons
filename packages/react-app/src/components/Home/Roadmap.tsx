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
  p-10
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
  w-full
  md:w-1/2
`

// Roadmap:
// 2021 Q4
// •  Launch token on Pancakeswap
// •  Launch website V1
// •  Begin development of launchpad platform
// •  Token locker V1 release
// •  Begin marketing campaign
// •  Website V2 update
// •  List on CoinGecko
// •  List on Coin Market Cap
// •  Beta launchpad release

// 2022 Q1
// •  Website V3 update
// •  Crypto Academy Price Prediction
// •  Work with influencers
// •  Launchpad full release

// 2022 Q2
// •  Further development - TBA

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
                <li style={{ textDecoration: 'line-through' }}>Launch website V1</li>
                <li style={{ textDecoration: 'line-through' }}>Begin development of launchpad platform</li>
                <li>Token locker V1 release</li>
                <li>Begin marketing campaign</li>
                <li>Website V2 update</li>
                <li>List on CoinGecko</li>
                <li>List on CoinMarketCap</li>
                <li>Beta launchpad release</li>
              </ul>
            </RoadmapSectionContent>
          </RoadmapSection>

          <RoadmapSection>
            <RoadmapSectionTitle>Q1 2022</RoadmapSectionTitle>

            <RoadmapSectionContent>
              <ul className="list-disc">
                <li>Website V3 update</li>
                <li>Crypto Academy Price Prediction</li>
                <li>Work with influencers</li>
                <li>Launchpad full release</li>
              </ul>
            </RoadmapSectionContent>
          </RoadmapSection>

          <RoadmapSection>
            <RoadmapSectionTitle>Q2 2022</RoadmapSectionTitle>

            <RoadmapSectionContent>
              <ul className="list-disc">
                <li>Further development - TBA</li>
              </ul>
            </RoadmapSectionContent>
          </RoadmapSection>
        </Content>
      </Inner>
    </Outer>
  )
}

export default Roadmap
