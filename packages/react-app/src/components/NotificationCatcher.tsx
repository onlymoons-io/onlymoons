import React, { createContext, useState, useRef, useEffect } from 'react'
import { useUnmount } from 'react-use'
import tw from 'tailwind-styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion'

const Outer = tw.div`
  relative
`

const NotificationOuter = tw.div`
  fixed
  top-0
  w-full
  z-50
  flex
  justify-center
  items-center
  pointer-events-none
`

const NotificationInner = tw.div`
  rounded
  p-5
  mt-5
  pointer-events-auto
  relative
`

const NotificationClose = tw.div`
  absolute
  top-0
  right-0
  -mr-2
  -mt-2
  w-7
  h-7
  rounded-full
  bg-indigo-500
  text-gray-100
  text-opacity-80
  flex
  justify-center
  items-center
  cursor-pointer
`

type NotificationLevel = 'info' | 'warning' | 'error' | 'success'

export interface INotification {
  message: string
  level?: NotificationLevel
}

export interface INotificationCatcherContext {
  //
  push?: (notification: INotification) => void
}

export const NotificationCatcherContext = createContext<INotificationCatcherContext>({})

export interface NotificationCatcherContextProviderProps {
  notificationDurationMS?: number
}

const NotificationCatcherContextProvider: React.FC<NotificationCatcherContextProviderProps> = ({
  children,
  notificationDurationMS = 5000,
}) => {
  const [notifications] = useState<INotification[]>([])
  const [activeNotification, setActiveNotification] = useState<INotification>()
  const timerRef = useRef<NodeJS.Timeout>()

  useUnmount(() => {
    timerRef.current && clearTimeout(timerRef.current)
  })

  const nextNotification = () => {
    setActiveNotification(notifications.shift())

    timerRef.current && clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      notifications.length ? nextNotification() : setActiveNotification(undefined)
    }, notificationDurationMS)
  }

  useEffect(() => {
    if (!activeNotification) {
      timerRef.current && clearTimeout(timerRef.current)
    }
  }, [activeNotification])

  return (
    <NotificationCatcherContext.Provider
      value={{
        push(notification: INotification) {
          notifications.push(notification)

          !activeNotification && nextNotification()
        },
      }}
    >
      <Outer>
        {children}
        {activeNotification && (
          <NotificationOuter>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.1 }}>
              <NotificationInner
                className={
                  activeNotification.level === 'error'
                    ? 'bg-red-500'
                    : activeNotification.level === 'warning'
                    ? 'bg-yellow-600'
                    : activeNotification.level === 'success'
                    ? 'bg-green-500'
                    : 'bg-blue-500'
                }
              >
                {activeNotification.message}

                <NotificationClose
                  onClick={() => {
                    //
                    nextNotification()
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} fixedWidth />
                </NotificationClose>
              </NotificationInner>
            </motion.div>
          </NotificationOuter>
        )}
      </Outer>
    </NotificationCatcherContext.Provider>
  )
}

export default NotificationCatcherContextProvider
