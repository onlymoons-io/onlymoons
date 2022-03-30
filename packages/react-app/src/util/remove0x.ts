/**
 * @param input input string
 * @returns the string, but with 0x removed
 */
export default function remove0x(input: string) {
  return input.replace(/^0x/, '')
}
