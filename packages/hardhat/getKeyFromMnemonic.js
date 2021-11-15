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
