/**
 * @param address input address
 * @returns the first and last 4 characters of the string
 */
export default function getShortAddress(address: string) {
  return `${address.substr(0, 4)}...${address.substr(address.length - 4, address.length)}`
}
