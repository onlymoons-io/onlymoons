import React from 'react'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'

const OuterCSS = styled.section`
  min-height: 320px;
`

const Outer = tw(OuterCSS)`
  relative
  bg-blue-600
  pb-10
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
  bg-blue-600
`

const InnerCSS = styled.div`
  min-height: 320px;
`

const Inner = tw(InnerCSS)`
  bg-blue-600
  relative
  z-1
  w-full
  flex
  flex-col
  justify-center
`

const ContractContent = tw.div`
  flex
  flex-col
  md:flex-row
`

const Content = tw.div`
  m-auto
`

const Contract: React.FC = () => {
  return (
    <Outer>
      <Angled>
        <AngledInner />
      </Angled>
      <Inner>
        <Content>
          <ContractContent>contract</ContractContent>
        </Content>
      </Inner>
    </Outer>
  )
}

export default Contract
