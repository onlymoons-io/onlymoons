import React, { CSSProperties, useState, useEffect, ReactNode, AnchorHTMLAttributes } from 'react'
import { useWeb3React } from '@web3-react/core'
import tw from 'tailwind-styled-components'
import styled from 'styled-components'
import { LinkProps, useLocation } from 'react-router-dom'
import LinkOrAnchor from '../LinkOrAnchor'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBook,
  faChartLine,
  // faExchangeAlt,
  faFaucet,
  faFileCode,
  // faHandsHolding,
  faLock,
  faPiggyBank,
  faRocket,
  faUniversity,
} from '@fortawesome/free-solid-svg-icons'
// import Tooltip from '../Tooltip'
import { useAppNavState } from '../../App'

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

const ItemCSS = styled(LinkOrAnchor)``

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

const Separator = tw.hr`
  mx-auto
  my-2
  border-gray-300
  dark:border-gray-800
  w-3/4
`

interface NavItemProps {
  icon?: ReactNode
  label?: string
  className?: string
  style?: CSSProperties
}

const NavItem: React.FC<NavItemProps & Partial<LinkProps> & AnchorHTMLAttributes<HTMLAnchorElement>> = ({
  to,
  icon = '',
  label = 'TEST',
  className = '',
  style = {},
  ...rest
}) => {
  const { pathname } = useLocation()
  const { isSmall, leftNavExpanded, setLeftNavExpanded } = useAppNavState()
  const [active, setActive] = useState<boolean>(false)

  useEffect(() => setActive(typeof to === 'string' ? pathname.startsWith(to) : false), [pathname, to])

  return (
    <>
      <Item
        data-tip={!leftNavExpanded}
        data-for={`tooltip-${typeof to === 'string' ? to.replace('/', '') : ''}`}
        to={to}
        className={`${className} ${leftNavExpanded ? 'justify-start px-5' : 'justify-center'} ${
          active ? 'bg-gray-100 dark:bg-gray-800 border-indigo-500' : ''
        }`}
        style={style}
        onClick={() => isSmall && setLeftNavExpanded(false)}
        {...rest}
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
  const { leftNavExpanded } = useAppNavState()

  return (
    <Outer className={`${leftNavExpanded ? 'border-r' : 'border-r-0'}`}>
      <Inner>
        <NavItem to="/launches" icon={<FontAwesomeIcon icon={faRocket} fixedWidth />} label="Launches" />
        <Separator />
        <NavItem to="/locker" icon={<FontAwesomeIcon icon={faLock} fixedWidth />} label="Locker" />
        {/* <NavItem to="/bridge" icon={<FontAwesomeIcon icon={faExchangeAlt} fixedWidth />} label="Bridge" /> */}
        <NavItem to="/staking" icon={<FontAwesomeIcon icon={faPiggyBank} fixedWidth />} label="Staking" />
        <NavItem to="/deployer" icon={<FontAwesomeIcon icon={faFileCode} fixedWidth />} label="Deployer" />
        <NavItem to="/governance" icon={<FontAwesomeIcon icon={faUniversity} fixedWidth />} label="Governance" />
        {/* <NavItem to="/fundraising" icon={<FontAwesomeIcon icon={faHandsHolding} fixedWidth />} label="Fundraising" /> */}
        {chainId === 97 && (
          <NavItem to="/faucet" icon={<FontAwesomeIcon icon={faFaucet} fixedWidth />} label="Faucet" />
        )}
        <Separator />
        <NavItem to="/stats" icon={<FontAwesomeIcon icon={faChartLine} fixedWidth />} label="Stats" />
        <NavItem
          href="https://onlymoons.gitbook.io/"
          icon={<FontAwesomeIcon icon={faBook} fixedWidth />}
          label="Documentation"
        />
      </Inner>
    </Outer>
  )
}

export default LeftNav
