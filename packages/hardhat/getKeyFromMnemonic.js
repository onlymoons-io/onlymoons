/**
 * this is a helper function for converting the mnemonic.txt file to a private key.
 * since this is dealing with private keys, use with caution.
 */

const { Wallet } = require("ethers");
const fs = require("fs");

const { fromMnemonic } = Wallet;

function mnemonic() {
  try {
    return fs.readFileSync("./mnemonic.txt").toString().trim();
  } catch (err) {
    console.error(err);
  }

  return "";
}

console.log(
  `private key for mnemonic.txt: ${fromMnemonic(mnemonic()).privateKey}`
);
