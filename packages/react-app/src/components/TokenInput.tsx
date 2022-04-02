import React, { useEffect, useState, createRef, CSSProperties } from 'react'
// import tw from 'tailwind-styled-components'
import { usePromise } from 'react-use'
import { useUtilContract } from './contracts/Util'
import { utils, BigNumber } from 'ethers'
// import { Primary as PrimaryButton } from './Button'
import { TokenData } from '../typings'
import humanNumber from 'human-number'

const { formatUnits } = utils

interface Props {
  //
  tokenData: TokenData
  maxValue?: BigNumber
  inputRef?: React.RefObject<HTMLInputElement>
  placeholder?: string
  disabled?: boolean
  className?: string
  style?: CSSProperties
  onChange?: (value: string) => void
}

const TokenInput: React.FC<Props> = ({
  tokenData,
  maxValue,
  inputRef,
  placeholder,
  disabled = false,
  className = '',
  style = {},
  onChange,
}) => {
  const mounted = usePromise()
  const [amount, setAmount] = useState<string>('')
  const { getTokenData } = useUtilContract()
  const [currentTokenData, setCurrentTokenData] = useState<TokenData>(tokenData)

  if (!inputRef) {
    inputRef = createRef<HTMLInputElement>()
  }

  useEffect(() => onChange && onChange(amount), [amount, onChange])

  useEffect(() => {
    if (!getTokenData) {
      setCurrentTokenData(tokenData)
      return
    }

    mounted(getTokenData(tokenData.address)).then((_tokenData) => _tokenData && setCurrentTokenData(_tokenData))
  }, [mounted, tokenData, getTokenData])

  return (
    <div className={`flex flex-col ${className}`} style={style}>
      <div className="self-end flex items-center gap-1">
        <span>Max:</span>

        <div
          className="text-indigo-400 cursor-pointer"
          style={{ maxWidth: '50%' }}
          onClick={() => {
            if (inputRef?.current && !disabled) {
              inputRef.current.value = formatUnits(maxValue || currentTokenData.balance, currentTokenData.decimals)
              setAmount(inputRef.current.value)
            }
          }}
        >
          {humanNumber(parseFloat(formatUnits(maxValue || currentTokenData.balance, currentTokenData.decimals)), (n) =>
            n.toLocaleString('en', { maximumFractionDigits: 2 }),
          )}
        </div>
      </div>

      <div className="flex gap-2 bg-white dark:bg-gray-900 rounded h-11">
        <input
          type="text"
          className={`flex-grow text-right bg-transparent text-gray-800 dark:text-gray-200 px-3 py-2 rounded text-lg outline-none disabled:opacity-30 ${
            disabled ? 'cursor-not-allowed' : ''
          }`}
          placeholder={placeholder}
          disabled={disabled}
          ref={inputRef}
          onInput={(e) => setAmount(e.currentTarget.value)}
        />

        {/* <PrimaryButton
          className="rounded-l-none text-gray-100"
          onClick={() => {
            //
            if (inputRef?.current) {
              inputRef.current.value = utils.formatUnits(tokenData.balance, tokenData.decimals)
              setAmount(inputRef.current.value)
            }
          }}
        >
          MAX
        </PrimaryButton> */}
      </div>
    </div>
  )
}

export default TokenInput
