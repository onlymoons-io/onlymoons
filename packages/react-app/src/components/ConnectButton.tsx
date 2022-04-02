import { CSSProperties, FC, useCallback } from 'react'
import { useMount, usePromise } from 'react-use'
import { useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'
// import { NetworkConnector } from '@web3-react/network-connector'
import { getShortAddress } from '../util'
import { Dark, Light, Primary, Secondary } from './Button'
import { useNotifications } from './NotificationCatcher'
import { networks } from '../util/getNetworkDataByChainId'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserSlash } from '@fortawesome/free-solid-svg-icons'

export interface ConnectButtonProps {
  color?: 'dark' | 'light' | 'primary' | 'secondary'
  className?: string
  style?: CSSProperties
}

const ConnectButton: FC<ConnectButtonProps> = ({ color = 'light', className = '', style = {} }) => {
  const mounted = usePromise()
  const { account, activate, deactivate } = useWeb3React()
  const { push: pushNotification } = useNotifications()

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
    await activate(
      new InjectedConnector({
        supportedChainIds: Object.keys(networks).map((chainId) => parseInt(chainId)),
      }),
      undefined,
      true,
    )
  }, [activate])

  const onClickConnect = useCallback(() => {
    if (account) {
      // already connected
      // TODO: open a menu instead of logging out
      deactivate()

      window.localStorage.setItem('ONLYMOONS_AUTO_CONNECT', '0')
    } else {
      // not connected
      mounted(connect())
        .then(() => window.localStorage.setItem('ONLYMOONS_AUTO_CONNECT', '1'))
        .catch((err) => {
          console.error(err)

          // open the error modal
          pushNotification &&
            pushNotification({
              message: err.message,
              level: 'error',
            })
        })
    }
  }, [mounted, account, deactivate, connect, pushNotification])

  // this auto connect should maybe not be in the button component.
  // it makes more sense to live in App.tsx or something.
  useMount(() => {
    if (window.localStorage.getItem('ONLYMOONS_AUTO_CONNECT') === '1') {
      mounted(connect()).catch((err) => {
        console.error(err)

        // open the error modal
        pushNotification &&
          pushNotification({
            message: err.message,
            level: 'error',
          })
      })
    }
  })

  const Button = getButton()

  return (
    <>
      <Button disabled={!(window as any).ethereum} className={className} style={style} onClick={onClickConnect}>
        {!(window as any).ethereum ? (
          <FontAwesomeIcon icon={faUserSlash} opacity={0.8} />
        ) : account ? (
          getShortAddress(account)
        ) : (
          'Connect'
        )}
      </Button>
    </>
  )
}

export default ConnectButton
