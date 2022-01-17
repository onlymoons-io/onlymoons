import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHammer } from '@fortawesome/free-solid-svg-icons'
import { Outer, MidSection, SectionInner } from './Layout'
import { motion } from 'framer-motion'

const ComingSoon: React.FC = () => {
  return (
    <Outer>
      <MidSection>
        <SectionInner className="flex flex-col gap-8 justify-center items-center">
          <motion.div
            initial={{ rotateZ: -30 }}
            animate={{ rotateZ: 0 }}
            transition={{ repeat: Infinity, repeatType: 'reverse' }}
          >
            <FontAwesomeIcon icon={faHammer} size="5x" fixedWidth />
          </motion.div>

          <div className="text-3xl">Coming soon!</div>
        </SectionInner>
      </MidSection>
    </Outer>
  )
}

export default ComingSoon
