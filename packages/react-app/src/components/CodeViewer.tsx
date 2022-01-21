import React, { CSSProperties } from 'react'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'
import CopyButton from './CopyButton'

const OuterCSS = styled.div`
  min-height: 320px;
`

const Outer = tw(OuterCSS)`
  bg-gray-200
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
  break-words
`

export interface CodeViewerProps {
  //
  children: string
  title?: string
  className?: string
  style?: CSSProperties
}

const CodeViewer: React.FC<CodeViewerProps> = ({ children, title = '', className = '', style = {} }) => {
  return (
    <Outer className={className} style={style}>
      <Header>
        <Title>{title}</Title>

        <Buttons>
          <CopyButton text={children} />
        </Buttons>
      </Header>

      <PreElem>
        <code>{children}</code>
      </PreElem>
    </Outer>
  )
}

export default CodeViewer
