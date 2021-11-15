import React from 'react'
import ReactTooltip, { TooltipProps } from 'react-tooltip'

const Tooltip: React.FC<TooltipProps> = ({ type = 'dark', effect = 'solid', ...rest }) => {
  return <ReactTooltip type={type} effect={effect} {...rest} />
}

export default Tooltip
