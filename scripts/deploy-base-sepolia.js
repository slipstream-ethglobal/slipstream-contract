const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying SlipstreamGaslessProxy to Base Sepolia...\n");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Deploying with account: ${deployer.address}`);
  
  // Get balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${hre.ethers.formatEther(balance)} ETH\n`);
  
  // Base Sepolia token address
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  
  console.log("🎯 Supported tokens:");
  console.log(`   - USDC: ${USDC_ADDRESS}\n`);
  
  // Get the contract factory
  const SlipstreamGaslessProxy = await hre.ethers.getContractFactory("SlipstreamGaslessProxy");
  
  // Deploy the contract
  console.log("⏳ Deploying contract...");
  const contract = await SlipstreamGaslessProxy.deploy(
    deployer.address,      // contractOwnerAddress
    [deployer.address],    // initialRelayerAddresses
    [USDC_ADDRESS]         // initialSupportedTokens
  );
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  
  console.log(`✅ SlipstreamGaslessProxy deployed to: ${contractAddress}`);
  console.log(`🔗 Network: Base Sepolia (Chain ID: 84532)`);
  
  // Get deployment transaction details
  const deploymentTx = contract.deploymentTransaction();
  if (deploymentTx) {
    console.log(`📋 Deployment tx hash: ${deploymentTx.hash}`);
    console.log(`⛽ Gas used: ${deploymentTx.gasLimit ? deploymentTx.gasLimit.toString() : 'Pending...'}`);
  }
  
  console.log("\n🔍 Block Explorer Links:");
  console.log(`Contract: https://sepolia.basescan.org/address/${contractAddress}`);
  if (deploymentTx) {
    console.log(`Transaction: https://sepolia.basescan.org/tx/${deploymentTx.hash}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });