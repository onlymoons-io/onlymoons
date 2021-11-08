import React from 'react'
import tw from 'tailwind-styled-components'

const Outer = tw.nav`
  bg-gray-800
  p-8
  sticky
  top-0
`

const NavBar: React.FC = () => {
  return <Outer>nav</Outer>
}

export default NavBar
