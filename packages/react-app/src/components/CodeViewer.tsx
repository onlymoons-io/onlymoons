import React, { CSSProperties, useRef, useState } from 'react'
import tw from 'tailwind-styled-components'
import { Light as Button } from './Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faCopy } from '@fortawesome/free-solid-svg-icons'
import { useUnmount } from 'react-use'

const Outer = tw.div`
  dark:bg-gray-900
  dark:bg-opacity-50
  p-4
  flex
  flex-col
  gap-4
  rounded
  overflow-auto
`

const Header = tw.div`
  flex
  justify-between
  items-center
`

const Title = tw.div`
  text-2xl
`

const Buttons = tw.div`
  grid
  grid-cols-1
  md:flex
  gap-2
  justify-between
  md:justify-end
`

const PreElem = tw.pre`
  text-gray-800
  dark:text-gray-200
  flex-grow
  overflow-auto
  text-sm
  whitespace-pre-wrap
`

export interface CodeViewerProps {
  //
  children: string
  copyAlertDuration?: number
  className?: string
  style?: CSSProperties
}

const CodeViewer: React.FC<CodeViewerProps> = ({ children, copyAlertDuration = 2000, className = '', style = {} }) => {
  const [isOnCopyCooldown, setIsOnCopyCooldown] = useState<boolean>(false)
  const copyTime = useRef<number>(0)
  const copyTimer = useRef<NodeJS.Timeout>()

  useUnmount(() => {
    setIsOnCopyCooldown(false)
    copyTimer.current && clearTimeout(copyTimer.current)
  })

  return (
    <Outer className={className} style={style}>
      <Header>
        <Title>ABI</Title>

        <Buttons>
          <Button
            disabled={isOnCopyCooldown}
            onClick={async () => {
              //
              try {
                navigator.clipboard.writeText(children)
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
            <FontAwesomeIcon icon={isOnCopyCooldown ? faCheck : faCopy} fixedWidth />{' '}
            <span>
              {isOnCopyCooldown ? (
                <>Copied</>
              ) : (
                <>
                  Copy <span className="hidden md:inline">to clipboard</span>
                </>
              )}
            </span>
          </Button>
        </Buttons>
      </Header>

      <PreElem>
        <code>{children}</code>
      </PreElem>
    </Outer>
  )
}

export default CodeViewer
