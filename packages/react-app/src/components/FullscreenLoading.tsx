import React from 'react'
import tw from 'tailwind-styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion'

const Outer = tw.div`
  fixed
  inset-0
  flex
  justify-center
  items-center
`

const FullscreenLoading: React.FC = ({ children }) => {
  return (
    <Outer>
      <motion.div
        className="flex flex-col gap-6 justify-center items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        <FontAwesomeIcon className="text-blue-600" icon={faCircleNotch} size="5x" fixedWidth spin />

        {children && <div>{children}</div>}
      </motion.div>
    </Outer>
  )
}

export default FullscreenLoading
