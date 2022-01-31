import React from 'react'
// import styled from 'styled-components'
import tw from 'tailwind-styled-components'
// import Anchor from '../Anchor'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'

const Outer = tw.footer`
  bg-blue-600
  dark:bg-gray-800
  py-10
`

const Inner = tw.div`
  p-10
  m-auto
  flex
  flex-col
  justify-center
  items-center
  max-w-5xl
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
            <RoadmapSectionTitle>PHASE 1</RoadmapSectionTitle>

            <RoadmapSectionContent>
              <ul className="list-disc">
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-green-500" /> Launch token on Pancakeswap
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-green-500" /> Launch website
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-green-500" /> Begin development of launchpad platform
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-green-500" />{' '}
                  <Link className="text-gray-900 dark:text-indigo-300" to="/locker">
                    Token locker V1
                  </Link>{' '}
                  release
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-green-500" /> OnlyMoons token relaunch
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-green-500" /> Solidity Finance Audits
                  <ul className="list-inside list-disc">
                    <li>
                      <a
                        className="text-gray-900 dark:text-indigo-300"
                        href="https://solidity.finance/audits/OnlyMoons/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Token <FontAwesomeIcon size="sm" icon={faExternalLinkAlt} opacity="0.5" />
                      </a>
                    </li>
                    <li>
                      <a
                        className="text-gray-900 dark:text-indigo-300"
                        href="https://solidity.finance/audits/OnlyMoonsTokenLockerV1/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Locker <FontAwesomeIcon size="sm" icon={faExternalLinkAlt} opacity="0.5" />
                      </a>
                    </li>
                  </ul>
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-green-500" /> Early tool adopters
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheck} className="text-green-500" />{' '}
                  <Link className="text-gray-900 dark:text-indigo-300" to="/staking">
                    Beta staking platform
                  </Link>{' '}
                  on BSC Testnet
                </li>
                <li>Multilingual support</li>
              </ul>
            </RoadmapSectionContent>
          </RoadmapSection>

          <RoadmapSection>
            <RoadmapSectionTitle>PHASE 2</RoadmapSectionTitle>

            <RoadmapSectionContent>
              <ul className="list-disc">
                <li>Beta launchpad release on BSC Testnet</li>
                <li>Staking platform release on BSC</li>
                <li>Configurable contract deployer on BSC</li>
                <li>List on CoinGecko</li>
                <li>List on CoinMarketCap</li>
              </ul>
            </RoadmapSectionContent>
          </RoadmapSection>

          <RoadmapSection>
            <RoadmapSectionTitle>PHASE 3</RoadmapSectionTitle>

            <RoadmapSectionContent>
              <ul className="list-disc">
                <li>Launchpad release on BSC</li>
                <li>Begin multi chain strategy</li>
                <li>Full marketing campaign</li>
                <li>Further development – TBA</li>
              </ul>
            </RoadmapSectionContent>
          </RoadmapSection>
        </Content>
      </Inner>
    </Outer>
  )
}

export default Roadmap
