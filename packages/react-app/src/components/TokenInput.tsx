import React, { useEffect, useState, createRef } from 'react'
// import tw from 'tailwind-styled-components'
import { utils } from 'ethers'
import { Primary as PrimaryButton } from './Button'
import { TokenData } from '../typings'

interface Props {
  //
  tokenData: TokenData
  inputRef?: React.RefObject<HTMLInputElement>
  placeholder?: string
  onChange?: (value: string) => void
}

const TokenInput: React.FC<Props> = ({ tokenData, inputRef, placeholder, onChange }) => {
  const [amount, setAmount] = useState<string>('')

  if (!inputRef) {
    inputRef = createRef<HTMLInputElement>()
  }

  useEffect(() => onChange && onChange(amount), [amount, onChange])

  return (
    <div className="flex gap-2 bg-white dark:bg-gray-700 rounded">
      <input
        type="text"
        className="flex-grow text-right bg-transparent text-gray-800 dark:text-gray-200 p-3 rounded text-xl outline-none"
        placeholder={placeholder}
        ref={inputRef}
        onInput={e => setAmount(e.currentTarget.value)}
      />

      <PrimaryButton
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
      </PrimaryButton>
    </div>
  )
}

export default TokenInput
