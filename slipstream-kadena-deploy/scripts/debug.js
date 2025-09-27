console.log("Script started");

import { chainweb, ethers, network, run } from 'hardhat';

console.log("Imports loaded");

async function main() {
  console.log("Main function started");
  
  console.log(`Network: ${network.name}`);
  
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
}

console.log("About to call main");
main()
  .then(() => {
    console.log("Main completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Main failed:", error);
    process.exit(1);
  });

