import React, { CSSProperties } from 'react'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'
import CodeViewer from './CodeViewer'

const OuterCSS = styled.div`
  width: 80vw;
  height: 80vh;
`

const Outer = tw(OuterCSS)`
  bg-gray-100
  dark:bg-gray-800
  p-4
  rounded
  flex
  flex-col
  gap-4
`

export interface ContractDetailsProps {
  address: string
  abi: string
  className?: string
  style?: CSSProperties
}

const ContractDetails: React.FC<ContractDetailsProps> = ({ children, address, abi, className = '', style = {} }) => {
  return (
    <Outer className={className} style={style}>
      <CodeViewer className="flex-grow" children={abi} />
    </Outer>
  )
}

export default ContractDetails
