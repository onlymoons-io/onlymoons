import React, { useState, ReactNode, CSSProperties } from 'react'
import { useMount } from 'react-use'
import tw from 'tailwind-styled-components'
import { motion } from 'framer-motion'

export const Outer = tw(motion.div)`
  h-full
  pointer-events-none
`

Outer.defaultProps = {
  initial: false,
}

export const Inner = tw.div`
  bg-gray-100
  text-gray-900
  dark:bg-gray-800
  dark:text-gray-200
  rounded
  h-full
  flex
  flex-col
  pointer-events-auto
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
  text-ellipsis
  flex
  justify-between
  items-center
  gap-3
`

export const Header = tw(Section)`
  bg-gray-200
  bg-opacity-50
  dark:bg-gray-900
  dark:bg-opacity-70
  border-l border-t border-r
  rounded-t
  border-gray-100
  dark:border-gray-800
`

export const Main = tw(Section)`
  rounded-b
  flex-grow
  flex
  flex-col
  overflow-auto
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
  innerClassName?: string
  style?: CSSProperties
}

const DetailsCard: React.FC<DetailsCardProps> = ({
  initialScale = 0.975,
  headerContent,
  mainContent,
  footerContent,
  className = '',
  innerClassName = '',
  style = {},
}) => {
  const [elemScale, setElemScale] = useState<number>(initialScale)

  useMount(() => setElemScale(1))

  return (
    <Outer className={className} animate={{ scale: elemScale }}>
      <Inner style={style} className={innerClassName}>
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
