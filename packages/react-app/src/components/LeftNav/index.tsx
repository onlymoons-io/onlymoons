import React, { CSSProperties, useState, useContext, useEffect, ReactNode } from 'react'
import { useWeb3React } from '@web3-react/core'
import tw from 'tailwind-styled-components'
import styled from 'styled-components'
import { Link, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChartLine,
  faExchangeAlt,
  faFaucet,
  faFileCode,
  // faHandsHolding,
  faLock,
  faPiggyBank,
  faRocket,
  faUniversity,
} from '@fortawesome/free-solid-svg-icons'
// import Tooltip from '../Tooltip'
import { AppNavState } from '../../App'

const Outer = tw.nav`
  bg-gray-200
  dark:bg-gray-900
  flex-grow
  border-gray-300
  dark:border-gray-800
  overflow-x-hidden
  overflow-y-auto
`

const Inner = tw.div`
  flex
  flex-col
`

const ItemCSS = styled(Link)``

const Item = tw(ItemCSS)`
  h-14
  hover:bg-gray-100
  dark:hover:bg-gray-800
  text-gray-800
  dark:text-gray-200
  flex
  items-center
  border-l-4
  border-transparent
`

const ItemLabelCSS = styled.span`
  ${ItemCSS}:hover & {
    text-decoration: underline;
  }
`

const ItemLabel = tw(ItemLabelCSS)`
  ml-2
`

interface NavItemProps {
  to: string
  icon?: ReactNode
  label?: string
  className?: string
  style?: CSSProperties
}

const NavItem: React.FC<NavItemProps> = ({ to, icon = '', label = 'TEST', className = '', style = {} }) => {
  const { pathname } = useLocation()
  const { leftNavExpanded } = useContext(AppNavState)
  const [active, setActive] = useState<boolean>(false)

  useEffect(() => setActive(pathname.startsWith(to)), [pathname, to])

  return (
    <>
      <Item
        data-tip={!leftNavExpanded}
        data-for={`tooltip-${to.replace('/', '')}`}
        to={to}
        className={`${className} ${leftNavExpanded ? 'justify-start px-5' : 'justify-center'} ${
          active ? 'bg-gray-100 dark:bg-gray-800 border-indigo-500' : ''
        }`}
        style={style}
      >
        <span className={`${active ? 'opacity-100' : 'opacity-40'}`}>{icon}</span>
        {leftNavExpanded && <ItemLabel>{label}</ItemLabel>}
      </Item>

      {/* {!leftNavExpanded && <Tooltip id={`tooltip-${to.replace('/', '')}`} place="right" children={label} />} */}
    </>
  )
}

const LeftNav: React.FC = () => {
  const { chainId } = useWeb3React()
  const { leftNavExpanded } = useContext(AppNavState)

  return (
    <Outer className={`${leftNavExpanded ? 'border-r' : 'border-r-0'}`}>
      <Inner>
        <NavItem to="/launches" icon={<FontAwesomeIcon icon={faRocket} fixedWidth />} label="Launches" />
        <hr className="mx-auto my-2 border-gray-300 dark:border-gray-800 w-3/4" />
        <NavItem to="/locker" icon={<FontAwesomeIcon icon={faLock} fixedWidth />} label="Locker" />
        <NavItem to="/bridge" icon={<FontAwesomeIcon icon={faExchangeAlt} fixedWidth />} label="Bridge" />
        <NavItem to="/staking" icon={<FontAwesomeIcon icon={faPiggyBank} fixedWidth />} label="Staking" />
        <NavItem to="/deployer" icon={<FontAwesomeIcon icon={faFileCode} fixedWidth />} label="Deployer" />
        <NavItem to="/governance" icon={<FontAwesomeIcon icon={faUniversity} fixedWidth />} label="Governance" />
        {/* <NavItem to="/fundraising" icon={<FontAwesomeIcon icon={faHandsHolding} fixedWidth />} label="Fundraising" /> */}
        {chainId === 97 && (
          <NavItem to="/faucet" icon={<FontAwesomeIcon icon={faFaucet} fixedWidth />} label="Faucet" />
        )}
        <hr className="mx-auto my-2 border-gray-300 dark:border-gray-800 w-3/4" />
        <NavItem to="/stats" icon={<FontAwesomeIcon icon={faChartLine} fixedWidth />} label="Stats" />
      </Inner>
    </Outer>
  )
}

export default LeftNav
