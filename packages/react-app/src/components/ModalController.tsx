import React, { ReactNode, createContext, useContext, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import tw from 'tailwind-styled-components'

const ModalOuter = tw.div`
  flex
  justify-center
  items-center
  w-full
  max-w-lg
`

export interface IModalControllerContext {
  currentModal?: ReactNode
  setCurrentModal: (modal: ReactNode) => void
  closeModal: () => void
}

export const ModalControllerContext = createContext<IModalControllerContext>({
  //
  setCurrentModal: () => {},
  closeModal: () => {},
})

export const useModal = () => {
  const modalController = useContext(ModalControllerContext)
  if (!modalController) throw new Error('useModal can only be used within ModalControllerProvider')
  return modalController
}

const ModalControllerProvider: React.FC = ({ children }) => {
  const [currentModal, setCurrentModal] = useState<ReactNode>()

  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCurrentModal(undefined)
    }

    if (currentModal) {
      document.documentElement.style.setProperty('overflow', 'hidden')
      document.addEventListener('keydown', onKeydown)
    } else {
      document.documentElement.style.setProperty('overflow', 'auto')
      document.removeEventListener('keydown', onKeydown)
    }

    return () => {
      document.removeEventListener('keydown', onKeydown)
    }
  }, [currentModal])

  const clickCloseHandler = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setCurrentModal(undefined)
    }
  }

  return (
    <ModalControllerContext.Provider
      value={{
        currentModal,
        setCurrentModal,
        closeModal: () => setCurrentModal(undefined),
      }}
    >
      {children}

      <motion.div
        className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90 z-40 flex justify-center items-center"
        initial={{ opacity: 0 }}
        style={{
          //
          // visibility: currentModal ? 'visible' : 'hidden',
          pointerEvents: currentModal ? 'auto' : 'none',
        }}
        animate={currentModal ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.1 }}
        onClick={clickCloseHandler}
      >
        <motion.div
          // NOTE: children will need to enable pointer-events manually with this setup
          className="w-full h-full flex justify-center items-center pointer-events-none px-4"
          initial={{ scale: 0.8 }}
          animate={{ scale: currentModal ? 1 : 0.8 }}
          transition={{ duration: 0.15 }}
        >
          <ModalOuter>{currentModal}</ModalOuter>
        </motion.div>
      </motion.div>
    </ModalControllerContext.Provider>
  )
}

export default ModalControllerProvider
