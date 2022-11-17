const { ethers } = require("hardhat");
require("dotenv").config({path: ".env"});
const { CRYPTO_DEVS_NFT_CONTRACT_ADDRESS } = require("../constants") 

async function main() {
  const cryptoDevsTokenContract = await ethers.getContractFactory("CryptoDevToken");

  const deployCryptoDevsTokenContract = await cryptoDevsTokenContract.deploy(CRYPTO_DEVS_NFT_CONTRACT_ADDRESS);

  console.log("CryptoDev token contract address:", deployCryptoDevsTokenContract.address)
}

main()
 .then(() => process.exit(0))
 .catch((error) => {
   console.log({error})
   process.exit(1)
})

// CryptoDev token contract address: 0x9Dbd533E815c86da6912641bD88c9e144464D52B