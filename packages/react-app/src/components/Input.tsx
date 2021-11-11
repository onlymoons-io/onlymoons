import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'

const ElemCSS = styled.input``

const Elem = tw(ElemCSS)`
  bg-gray-800
  text-gray-200
  outline-none
  active:border-blue-500
  px-4
  py-2
  rounded
  disabled:opacity-50
  ${(props) => (props.disabled ? 'cursor-not-allowed' : 'cursor-text')}
`
Elem.defaultProps = {
  type: 'text',
}

interface Props {
  /** disabled isn't coming through HTMLAttributes<HTMLInputElement> for some reason */
  disabled?: boolean
}

const Input: React.FC<Props & HTMLAttributes<HTMLInputElement>> = ({ children, disabled = false, ...rest }) => {
  return <Elem disabled={disabled} {...rest} />
}

export default Input
