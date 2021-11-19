import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'

const OuterCSS = styled.section`
  min-height: 320px;
`

const Outer = tw(OuterCSS)`
  relative
  bg-blue-500
  dark:bg-blue-800
  pb-16
`

const Angled = tw.div`
  h-xl
  w-full
  flex
  justify-center
  overflow-hidden
  z-0
`

const AngledInnerCSS = styled.div`
  height: 150px;
  width: 150%;
  top: -80px;
  transform: rotateZ(-3deg);
  overflow: hidden;
`

const AngledInner = tw(AngledInnerCSS)`
  absolute
  bg-blue-500
  dark:bg-blue-800
`

const InnerCSS = styled.div`
  min-height: 320px;
`

const Section = tw.section`
  px-5
  md:px-10
`

const Inner = tw(InnerCSS)`
  relative
  z-1
  container
  m-auto
`

interface Props {
  angle?: number
}

const AngledSection: React.FC<Props & HTMLAttributes<HTMLDivElement>> = ({ children, angle = -2.5, ...rest }) => {
  return (
    <Outer {...rest}>
      <Angled>
        <AngledInner style={{ transform: `rotateZ(${angle}deg)` }} />
      </Angled>

      <Section>
        <Inner>{children}</Inner>
      </Section>
    </Outer>
  )
}

export default AngledSection
