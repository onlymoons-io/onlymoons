import React, { useEffect, useState } from 'react'
import { usePromise } from 'react-use'
import { BigNumber } from 'ethers'
import { useFeesContract } from '../contracts/Fees'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { utils } from 'ethers'
import { getNativeCoin } from '../../util'
import { useWeb3React } from '@web3-react/core'

const { formatEther } = utils

export interface TotalFeesProps {
  // external
  infiniteLock?: boolean

  // values
  defaultTotalFees?: BigNumber

  // handlers
  onSetTotalFees?: (value: BigNumber) => void
}

export const TotalFees: React.FC<TotalFeesProps> = ({ defaultTotalFees, onSetTotalFees, infiniteLock = false }) => {
  const mounted = usePromise()
  const { chainId } = useWeb3React()
  const { getAdjustedFeeAmountForType } = useFeesContract()
  const [totalFees, setTotalFees] = useState<BigNumber | undefined>(defaultTotalFees)

  useEffect(() => {
    typeof totalFees !== 'undefined' && onSetTotalFees && onSetTotalFees(totalFees)
  }, [totalFees, onSetTotalFees])

  useEffect(() => {
    if (!getAdjustedFeeAmountForType) {
      setTotalFees(BigNumber.from(0))
      return
    }

    if (!infiniteLock) {
      setTotalFees(BigNumber.from(0))
      return
    }

    setTotalFees(undefined)

    mounted(getAdjustedFeeAmountForType('CreateInfiniteLock'))
      .then(setTotalFees)
      .catch((err) => {
        console.error(err)
        setTotalFees(BigNumber.from(0))
      })
  }, [mounted, infiniteLock, getAdjustedFeeAmountForType])

  return (
    <div>
      Fee:{' '}
      {totalFees ? (
        `${formatEther(totalFees)} ${getNativeCoin(chainId || 0).symbol}`
      ) : (
        <FontAwesomeIcon icon={faCircleNotch} spin fixedWidth />
      )}{' '}
    </div>
  )
}
