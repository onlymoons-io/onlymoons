import React from 'react'
import { SwitchProps } from '@radix-ui/react-switch'
import { Root, Thumb, Label } from './styles'
import { ReactNode } from 'react'

export interface StyledSwitchProps extends SwitchProps {
  label?: ReactNode | string
}

const StyledSwitch: React.FC<StyledSwitchProps> = ({ label, ...rest }) => {
  return (
    <Label>
      {label}
      <Root {...rest}>
        <Thumb />
      </Root>
    </Label>
  )
}

export default StyledSwitch
