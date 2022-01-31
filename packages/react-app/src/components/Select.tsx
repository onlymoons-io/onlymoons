import React, { ChangeEventHandler, SelectHTMLAttributes } from 'react'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'

const SelectElemCSS = styled.select`
  appearance: none;
  background-image: url('http://cdn1.iconfinder.com/data/icons/cc_mono_icon_set/blacks/16x16/br_down.png');
  background-repeat: no-repeat;
  background-position: 95%;
`

const SelectElem = tw(SelectElemCSS)`
  p-4
  bg-gray-200
  dark:bg-gray-700
  rounded outline-none
`

export interface OptionProps {
  readonly label: string
  readonly value?: string | number | readonly string[]
}

export interface SelectProps {
  readonly options: Array<OptionProps>
  readonly onChange?: ChangeEventHandler<HTMLSelectElement>
  readonly ref?: React.MutableRefObject<HTMLSelectElement | null>
}

const Select: React.FC<SelectHTMLAttributes<HTMLSelectElement> & SelectProps> = ({
  options,
  onChange,
  className = '',
  style = {},
  ...rest
}) => {
  return (
    <SelectElem className={className} style={style} onChange={onChange} {...rest}>
      {options.map(({ label, value }) => (
        <option value={value}>{label}</option>
      ))}
    </SelectElem>
  )
}

export default Select
