import React, { HTMLAttributes, ReactNode } from 'react'
import * as RadixTooltip from '@radix-ui/react-tooltip'
import tw from 'tailwind-styled-components'

export const TooltipRoot = RadixTooltip.Root
export const TooltipPortal = RadixTooltip.Portal
export const TooltipProvider = RadixTooltip.Provider
export const TooltipTrigger = RadixTooltip.Trigger

export const TooltipContent = tw(RadixTooltip.Content)`
  bg-gray-100
  dark:bg-gray-900
  text-gray-900
  dark:text-gray-100
  border
  border-gray-500
  border-opacity-20
  rounded
  p-2
`

export interface TooltipOptions extends HTMLAttributes<HTMLElement> {
  trigger: ReactNode
  children?: ReactNode
  rootOptions?: RadixTooltip.TooltipProps
  portalOptions?: RadixTooltip.PortalProps
  contentOptions?: RadixTooltip.TooltipContentProps
}

const Tooltip: React.FC<TooltipOptions> = ({
  trigger,
  children,
  rootOptions = { delayDuration: 0 },
  portalOptions,
  contentOptions,
}) => {
  return (
    <TooltipRoot {...rootOptions}>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipPortal {...portalOptions}>
        <TooltipContent {...contentOptions}>{children}</TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  )
}

export default Tooltip
