import React, { CSSProperties, useState, createRef } from 'react'
import { useMount, useUnmount } from 'react-use'
import { motion } from 'framer-motion'

const PI_BY_180 = 180 / Math.PI

export interface RotateToCursorProps {
  duration?: number
  className?: string
  style?: CSSProperties
  ref?: React.RefObject<HTMLDivElement>
}

const RotateToCursor: React.FC<RotateToCursorProps> = ({ children, duration = 0, ref, ...rest }) => {
  const [angle, setAngle] = useState<number>(0)

  if (!ref) {
    ref = createRef<HTMLDivElement>()
  }

  const onMouseMove = (e: MouseEvent) => {
    //
    if (!ref?.current) return

    const { top, left, width, height } = ref.current.getBoundingClientRect()

    const centerX = left + width / 2
    const centerY = top + height / 2
    setAngle(Math.atan2(e.clientY - centerY, e.clientX - centerX) * PI_BY_180)
  }

  useMount(() => {
    window.addEventListener('mousemove', onMouseMove)
  })

  useUnmount(() => {
    window.removeEventListener('mousemove', onMouseMove)
  })

  return (
    <motion.div transition={{ duration }} initial={{ rotateZ: 0 }} animate={{ rotateZ: angle }} ref={ref} {...rest}>
      {children}
    </motion.div>
  )
}

export default RotateToCursor
