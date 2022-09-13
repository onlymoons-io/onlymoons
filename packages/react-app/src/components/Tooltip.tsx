import React from 'react'
import ReactTooltip, { TooltipProps } from 'react-tooltip'

// react-tooltip seems broken now. the only way it works
// is converting to any, and forcing typescript to allow any.
// we should switch to using radix-ui tooltips!!!
// tooltips no longer disappear on mouseout
const ReactTooltipANY = ReactTooltip as any

const Tooltip: React.FC<TooltipProps> = ({ type = 'dark', effect = 'solid', ...rest }) => {
  return <ReactTooltipANY type={type} effect={effect} {...rest} />
}

export default Tooltip
