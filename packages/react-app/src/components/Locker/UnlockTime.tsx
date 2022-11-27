import React, { useState, useEffect } from 'react'
import Tooltip from '../Tooltip'
import StyledSwitch from '../StyledSwitch'
import { timestampToDateTimeLocal } from '../../util'

export interface UnlockTimeOptions {
  // values
  defaultInfiniteLock?: boolean
  defaultUnlockTime?: number

  // handlers
  onSetInfiniteLock?: (value: boolean) => void
  onSetUnlockTime?: (value: number) => void
}

export const UnlockTime: React.FC<UnlockTimeOptions> = ({
  defaultInfiniteLock = false,
  onSetInfiniteLock,
  defaultUnlockTime,
  onSetUnlockTime,
}) => {
  const [infiniteLock, setInfiniteLock] = useState<boolean>(defaultInfiniteLock)
  const [unlockTime, setUnlockTime] = useState<number | undefined>(defaultUnlockTime)

  useEffect(() => {
    onSetInfiniteLock && onSetInfiniteLock(infiniteLock)
  }, [infiniteLock, onSetInfiniteLock])

  useEffect(() => {
    typeof unlockTime !== 'undefined' && onSetUnlockTime && onSetUnlockTime(unlockTime)
  }, [unlockTime, onSetUnlockTime])

  return (
    <div className="flex gap-4 items-center justify-center">
      <Tooltip
        trigger={
          <div className="flex flex-col items-center">
            <div>Infinite</div>
            <StyledSwitch
              defaultChecked={infiniteLock}
              onCheckedChange={(value) => {
                setInfiniteLock(value)
              }}
            ></StyledSwitch>
          </div>
        }
      >
        <div className="w-64 max-w-full">
          "Infinite" locks remain locked until the owner starts the unlock countdown, which then sets the unlock time.
          The unlock countdown is a globally defined duration. When the countdown has expired, token(s) can be removed.
        </div>
      </Tooltip>

      <div
        className={`grow flex bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded items-center ${
          infiniteLock ? 'opacity-40' : ''
        }`}
      >
        <div className="p-3 shrink-0">Unlock time</div>
        <input
          type="datetime-local"
          className="flex-grow p-3 outline-none bg-white dark:bg-gray-700 rounded-r"
          defaultValue={unlockTime ? timestampToDateTimeLocal(unlockTime) : undefined}
          disabled={infiniteLock}
          onInput={(e) => setUnlockTime(Math.ceil(new Date(e.currentTarget.value).getTime() / 1000))}
        />
      </div>
    </div>
  )
}
