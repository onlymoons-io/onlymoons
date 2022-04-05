const path = require('path')
const fs = require('fs')
const contractsDir = path.join(__dirname, 'src', 'contracts')
const contractsSource = path.join(contractsDir, 'hardhat_contracts.json')
const contractsDest = path.join(contractsDir, 'compiled_contracts.json')

const contractsData = require(contractsSource)

const compiledContracts = {}

// skip these contracts, because we just don't need them
const contractsToSkip = ['ERC20', 'OnlyMoons']

for (const chainId of Object.keys(contractsData)) {
  for (const networkName of Object.keys(contractsData[chainId])) {
    for (const contractName of Object.keys(contractsData[chainId][networkName].contracts)) {
      if (contractsToSkip.some((v) => v === contractName)) continue

      if (!compiledContracts[contractName]) {
        compiledContracts[contractName] = {
          networks: {},
          abi: contractsData[chainId][networkName].contracts[contractName].abi,
        }
      }

      compiledContracts[contractName].networks[chainId] = {
        [networkName]: contractsData[chainId][networkName].contracts[contractName].address,
      }
    }
  }
}

fs.writeFileSync(contractsDest, JSON.stringify(compiledContracts, null, 2))
