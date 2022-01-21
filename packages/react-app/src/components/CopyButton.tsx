import React, { useState, useRef, CSSProperties } from 'react'
import { useUnmount } from 'react-use'
import { Light as Button } from './Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faCopy } from '@fortawesome/free-solid-svg-icons'

export interface CopyButtonProps {
  text: string
  iconOnly?: boolean
  copyAlertDuration?: number
  className?: string
  style?: CSSProperties
}

const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  iconOnly = false,
  copyAlertDuration = 2000,
  className = '',
  style = {},
}) => {
  const [isOnCopyCooldown, setIsOnCopyCooldown] = useState<boolean>(false)
  const copyTime = useRef<number>(0)
  const copyTimer = useRef<NodeJS.Timeout>()

  useUnmount(() => {
    setIsOnCopyCooldown(false)
    copyTimer.current && clearTimeout(copyTimer.current)
  })

  return (
    <Button
      className={className}
      style={style}
      disabled={isOnCopyCooldown}
      onClick={async () => {
        //
        try {
          await navigator.clipboard.writeText(text)
          setIsOnCopyCooldown(true)
          copyTime.current = Date.now()

          copyTimer.current = setTimeout(() => {
            setIsOnCopyCooldown(false)
          }, copyAlertDuration)
        } catch (err) {
          console.error(err)
        }
      }}
    >
      <FontAwesomeIcon icon={isOnCopyCooldown ? faCheck : faCopy} fixedWidth />
      {!iconOnly && (
        <>
          {' '}
          <span>{isOnCopyCooldown ? <>Copied</> : <>Copy</>}</span>
        </>
      )}
    </Button>
  )
}

export default CopyButton
