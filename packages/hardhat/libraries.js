// npx hardhat verify --network <network name> <Util address>
// npx hardhat verify --network <network name> <OnlyMoons token address>
// npx hardhat verify --network <network name> --libraries libraries.js <TokenLockerManagerV1 address>
// npx hardhat verify --network <network name> --libraries libraries.js <TokenLockerV1 address> <TokenLockerManagerV1 address> 0 <owner wallet 0x033264EeFcf2edD6cE51DB57102eAA94289C4828> <token address 0xe789768a40Ac016332EC75DEDb6356E3D2011Eb9> 99999999999
module.exports = {
  // testnet
  // Util: "0x82CD31c0a0de621b52ee80f8f14d55Ffd5cb734A",
  // mainnet - NEVER CHANGE!
  Util: "0x8BF6Fa865f15887a95d3aF202Ab34ed0C754a2dE",
};
