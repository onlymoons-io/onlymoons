import React, { createContext, useContext, useState, useRef, useEffect } from 'react'
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
  mx-4
  pointer-events-auto
  relative
  max-w-lg
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
  bg-gray-100
  dark:bg-gray-900
  border-2
  text-gray-900
  dark:text-gray-100
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
  push?: (notification: INotification | Error | string) => void
}

export const NotificationCatcherContext = createContext<INotificationCatcherContext>({})

export const useNotifications = () => {
  const notifications = useContext(NotificationCatcherContext)
  if (!notifications) throw new Error('useNotifications can only be used within NotificationCatcherContextProvider')
  return notifications
}

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
        push(notification: INotification | Error | string) {
          if (notification instanceof Error || ((notification as any).message && (notification as any).code)) {
            console.error(notification)
            notifications.push({
              message: `${(notification as any).message} - ${(notification as any).data?.message}`,
              level: 'error',
            })
          } else if (typeof notification === 'string') {
            console.log(notification)
            notifications.push({
              message: notification,
              level: 'info',
            })
          } else {
            console.log(notification)
            notifications.push(notification)
          }

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
                  className={
                    activeNotification.level === 'error'
                      ? 'border-red-500'
                      : activeNotification.level === 'warning'
                      ? 'border-yellow-600'
                      : activeNotification.level === 'success'
                      ? 'border-green-500'
                      : 'border-blue-500'
                  }
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
