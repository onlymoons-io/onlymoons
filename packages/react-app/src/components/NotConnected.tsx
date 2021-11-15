import React from 'react'
import ConnectButton from './ConnectButton'

interface Props {
  text: string
}

const NotConnected: React.FC<Props> = ({ text }) => {
  return (
    <div className="flex flex-col gap-4 justify-center items-center w-full">
      <div className="text-center text-2xl font-extralight">{text}</div>

      <ConnectButton color="primary" />
    </div>
  )
}

export default NotConnected
