export default function getExplorerContractLink(chainId: number, address: string) {
  switch (chainId) {
    case 56:
    default:
      return `https://bscscan.com/address/${address}#code`
    case 97:
      return `https://testnet.bscscan.com/address/${address}#code`
    case 1088:
      return `https://andromeda-explorer.metis.io/address/${address}`
  }
}
