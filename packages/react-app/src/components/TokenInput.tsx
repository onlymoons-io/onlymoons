import React, { useEffect, useState, createRef, CSSProperties } from 'react'
// import tw from 'tailwind-styled-components'
import { utils, BigNumber } from 'ethers'
import { Primary as PrimaryButton } from './Button'
import { TokenData } from '../typings'
import humanNumber from 'human-number'

interface Props {
  //
  tokenData: TokenData
  maxValue?: BigNumber
  inputRef?: React.RefObject<HTMLInputElement>
  placeholder?: string
  className?: string
  style?: CSSProperties
  onChange?: (value: string) => void
}

const TokenInput: React.FC<Props> = ({ tokenData, maxValue, inputRef, placeholder, className, style, onChange }) => {
  const [amount, setAmount] = useState<string>('')

  if (!inputRef) {
    inputRef = createRef<HTMLInputElement>()
  }

  useEffect(() => onChange && onChange(amount), [amount, onChange])

  return (
    <div className={`flex flex-col ${className}`} style={style}>
      <div className="self-end flex items-center gap-1">
        <span>Max:</span>

        <div
          className="text-indigo-400 cursor-pointer"
          style={{ maxWidth: '50%' }}
          onClick={() => {
            if (inputRef?.current) {
              inputRef.current.value = utils.formatUnits(maxValue || tokenData.balance, tokenData.decimals)
              setAmount(inputRef.current.value)
            }
          }}
        >
          {humanNumber(parseFloat(utils.formatUnits(maxValue || tokenData.balance, tokenData.decimals)), n =>
            n.toLocaleString('en', { maximumFractionDigits: 2 }),
          ).toLowerCase()}
        </div>
      </div>

      <div className="flex gap-2 bg-white dark:bg-gray-800 rounded h-11">
        <input
          type="text"
          className="flex-grow text-right bg-transparent text-gray-800 dark:text-gray-200 px-3 py-2 rounded text-lg outline-none"
          placeholder={placeholder}
          ref={inputRef}
          onInput={e => setAmount(e.currentTarget.value)}
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
