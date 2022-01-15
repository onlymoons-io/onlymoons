export default function getExplorerTokenLink(chainId: number, address: string) {
  switch (chainId) {
    case 56:
    default:
      return `https://bscscan.com/token/${address}`
    case 97:
      return `https://testnet.bscscan.com/token/${address}`
    case 1088:
      return `https://andromeda-explorer.metis.io/token/${address}`
  }
}
