import React from 'react'
// import styled from 'styled-components'
import tw from 'tailwind-styled-components'

const Outer = tw.div`
  bg-gray-200
  text-gray-900
  rounded
`

const Inner = tw.div`

`

const Section = tw.section`
  p-4
`

const Title = tw.h3`
  text-2xl
  font-light
`

const Details = tw.div`

`

const Lock: React.FC = () => {
  return (
    <Outer>
      <Inner>
        <Section>
          <Title>Token or pair name</Title>
        </Section>

        <Section>
          <Details>Lock details</Details>
        </Section>
      </Inner>
    </Outer>
  )
}

export default Lock
