import { ethers, network } from 'hardhat';

async function main() {
  console.log("🚀 Testing simple deployment...\n");
  
  console.log(`📝 Network: ${network.name}`);
  console.log(`🔍 Network details:`, {
    name: network.name,
    chainId: network.config.chainId,
    url: network.config.url
  });

  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deployer: ${deployer.address}`);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

