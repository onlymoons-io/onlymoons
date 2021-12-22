import React, { useState, ReactNode, CSSProperties } from 'react'
import { useMount } from 'react-use'
import tw from 'tailwind-styled-components'
import { motion } from 'framer-motion'

export const Outer = tw(motion.div)`
  
`

Outer.defaultProps = {
  initial: false,
}

export const Inner = tw.div`
  bg-gray-200
  text-gray-900
  dark:bg-gray-800
  dark:text-gray-200
  rounded
`

export const Section = tw.section`
  p-4
  relative
`

export const Title = tw.h3`
  text-2xl
  font-light
  text-overflow
  overflow-hidden
  overflow-ellipsis
  flex
  justify-between
  items-center
  gap-3
`

export const Header = tw(Section)``

export const Main = tw(Section)`
  bg-gray-100
  dark:bg-gray-900
  rounded-b
`

export const Footer = tw(Section)`
  flex
  flex-col
  justify-between
  w-full
`

export interface DetailProps {
  label: React.ReactNode
  value: React.ReactNode
}

export const Detail: React.FC<DetailProps> = ({ label, value }) => {
  return (
    <div className="flex flex-col">
      <div className="text-lg">{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  )
}

export interface DetailsCardProps {
  //
  initialScale?: number
  headerContent?: ReactNode
  mainContent?: ReactNode
  footerContent?: ReactNode
  className?: string
  style?: CSSProperties
}

const DetailsCard: React.FC<DetailsCardProps> = ({
  initialScale = 0.975,
  headerContent,
  mainContent,
  footerContent,
  className = '',
  style = {},
}) => {
  const [elemScale, setElemScale] = useState<number>(initialScale)

  useMount(() => setElemScale(1))

  return (
    <Outer animate={{ scale: elemScale }}>
      <Inner style={style} className={className}>
        {/* header */}
        <Header children={headerContent} />

        {/* main content */}
        <Main children={mainContent} />

        {/* footer */}
        {footerContent && <Footer children={footerContent} />}
      </Inner>
    </Outer>
  )
}

export default DetailsCard
