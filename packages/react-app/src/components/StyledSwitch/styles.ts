import styled from 'styled-components'
import tw from 'tailwind-styled-components'
import * as Switch from '@radix-ui/react-switch'

const StyledRoot = styled(Switch.Root)`
  width: 48px;
  height: 26px;
`

export const Root = tw(StyledRoot)`
  bg-gray-300
  dark:bg-gray-700
  rounded-full
  relative
  shadow
  px-1
  flex
  items-center
`

const StyledThumb = styled(Switch.Thumb)`
  width: 20px;
  height: 20px;
  transform: translateX(0);
  filter: saturate(0.25);

  &[data-state='checked'] {
    transform: translateX(100%);
    filter: saturate(1);
  }
`

export const Thumb = tw(StyledThumb)`
  block
  bg-blue-500
  rounded-full
  shadow
  transition-all
`

export const Label = tw.label`
  cursor-pointer
  flex
  items-center
  gap-2
  select-none
`
