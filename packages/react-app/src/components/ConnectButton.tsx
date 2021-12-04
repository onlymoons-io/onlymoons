import { FC, useCallback } from 'react'
import { useMount } from 'react-use'
import { useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'
import Tooltip from './Tooltip'
import { getShortAddress } from '../util'
import { Dark, Light, Primary, Secondary } from './Button'
import contracts from '../contracts/production_contracts.json'

interface Props {
  color?: 'dark' | 'light' | 'primary' | 'secondary'
}

const ConnectButton: FC<Props> = ({ color = 'dark' }) => {
  const w3 = useWeb3React()

  const getButton = () => {
    switch (color) {
      case 'dark':
        return Dark
      case 'light':
        return Light
      case 'primary':
        return Primary
      case 'secondary':
        return Secondary
    }
  }

  const connect = useCallback(async () => {
    await w3.activate(
      new InjectedConnector({
        supportedChainIds: Object.keys(contracts).map(chainId => parseInt(chainId)),
      }),
      undefined,
      true,
    )
  }, [w3])

  const onClickConnect = useCallback(() => {
    if (w3.account) {
      // already connected
      // TODO: open a menu instead of logging out
      w3.deactivate()

      window.localStorage.setItem('ONLYMOONS_AUTO_CONNECT', '0')
    } else {
      // not connected
      connect()
        .then(() => window.localStorage.setItem('ONLYMOONS_AUTO_CONNECT', '1'))
        .catch(err => {
          console.error(err)

          // open the error modal
        })
    }
  }, [w3, connect])

  // this auto connect should maybe not be in the button component.
  // it makes more sense to live in App.tsx or something.
  useMount(() => {
    if (window.localStorage.getItem('ONLYMOONS_AUTO_CONNECT') === '1') {
      connect().catch(console.error)
    }
  })

  const Button = getButton()

  return (
    <>
      <Button data-tip={true} data-for="connect-button" onClick={onClickConnect}>
        {w3.account ? getShortAddress(w3.account) : 'Connect'}
      </Button>

      <Tooltip id="connect-button">Currently only available on BSC</Tooltip>
    </>
  )
}

export default ConnectButton
