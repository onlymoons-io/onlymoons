import React from 'react'
import { Light as Button } from './Button'
import { NetworkData } from '../typings'
import { useNetworkSwitcherContext } from './NetworkSwitcher'

export interface SwitchNetworkButtonProps {
  targetNetwork?: NetworkData
}

const SwitchNetworkButton: React.FC<SwitchNetworkButtonProps> = ({ targetNetwork, ...rest }) => {
  const { switchNetwork } = useNetworkSwitcherContext()

  return (
    <Button
      {...rest}
      onClick={() => {
        if (!targetNetwork) return

        switchNetwork(targetNetwork.chainId)
      }}
    >
      {targetNetwork?.name || 'unknown'}
    </Button>
  )
}

export default SwitchNetworkButton
