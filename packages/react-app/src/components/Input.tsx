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
  ${props =>
    props.color === 'dark'
      ? `
    bg-gray-800
    text-gray-200
  `
      : `
    bg-gray-200
    text-gray-800
  `}
  ${props => (props.disabled ? 'cursor-not-allowed' : 'cursor-text')}
`
Elem.defaultProps = {
  type: 'text',
}

interface Props {
  color?: 'dark' | 'light'
}

const Input: React.FC<Props & InputHTMLAttributes<HTMLInputElement>> = ({ children, color = 'light', ...rest }) => {
  return <Elem color={color} {...rest} />
}

export default Input
