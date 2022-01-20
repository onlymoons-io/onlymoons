import { BigNumber, utils } from 'ethers'
import humanNumber from 'human-number'

const { formatUnits } = utils

/**
 *
 * @param num expects a float with at least 1 decimal precision
 */
const getNumLeadingZeroes = (num: string) => {
  const split = num.split('.')
  const fractionValue = split[1] || '0'

  let numLeadingZeroes = 0

  for (; numLeadingZeroes < fractionValue.length; numLeadingZeroes++) {
    if (fractionValue[numLeadingZeroes] !== '0') {
      break
    }
  }

  return numLeadingZeroes
}

export const getFormattedAmountFromString = (amount: string): string => {
  return humanNumber(parseFloat(amount), n =>
    n.toLocaleString(undefined, { maximumFractionDigits: Math.min(getNumLeadingZeroes(n.toString()) + 3, 18) }),
  )
}

export default function getFormattedAmount(amount: BigNumber, decimals: number = 18): string {
  return getFormattedAmountFromString(formatUnits(amount, decimals))
}
