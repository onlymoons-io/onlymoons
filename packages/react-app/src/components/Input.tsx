import React, { InputHTMLAttributes } from 'react'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'

const ElemCSS = styled.input``

const Elem = tw(ElemCSS)`
  outline-none
  px-4
  py-2
  rounded
  disabled:opacity-50
  bg-gray-100
  text-gray-800
  dark:bg-gray-700
  dark:text-gray-200
  ${props => (props.disabled ? 'cursor-not-allowed' : 'cursor-text')}
`
Elem.defaultProps = {
  type: 'text',
}

const Input: React.FC<InputHTMLAttributes<HTMLInputElement>> = ({ children, ...rest }) => {
  return <Elem {...rest} />
}

export default Input
