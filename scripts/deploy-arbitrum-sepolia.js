const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying SlipstreamGaslessProxy to Arbitrum Sepolia...\n");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Deploying with account: ${deployer.address}`);
  
  // Get balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${hre.ethers.formatEther(balance)} ETH\n`);
  
  // Arbitrum Sepolia token addresses
  const PYUSD_ADDRESS = "0x637A1259C6afd7E3AdF63993cA7E58BB438aB1B1";  // PayPal USD
  const USDC_ADDRESS = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";   // Circle USDC
  
  console.log("🎯 Supported tokens:");
  console.log(`   - PayPal USD (PYUSD): ${PYUSD_ADDRESS}`);
  console.log(`   - Circle USDC: ${USDC_ADDRESS}\n`);
  
  // Get the contract factory
  const SlipstreamGaslessProxy = await hre.ethers.getContractFactory("SlipstreamGaslessProxy");
  
  // Deploy the contract
  console.log("⏳ Deploying contract...");
  const contract = await SlipstreamGaslessProxy.deploy(
    deployer.address,                    // contractOwnerAddress
    [deployer.address],                  // initialRelayerAddresses
    [PYUSD_ADDRESS, USDC_ADDRESS]        // initialSupportedTokens
  );
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  
  console.log(`✅ SlipstreamGaslessProxy deployed to: ${contractAddress}`);
  console.log(`🔗 Network: Arbitrum Sepolia (Chain ID: 421614)`);
  
  // Get deployment transaction details
  const deploymentTx = contract.deploymentTransaction();
  if (deploymentTx) {
    console.log(`📋 Deployment tx hash: ${deploymentTx.hash}`);
    console.log(`⛽ Gas used: ${deploymentTx.gasLimit ? deploymentTx.gasLimit.toString() : 'Pending...'}`);
  }
  
  console.log("\n🔍 Block Explorer Links:");
  console.log(`Contract: https://sepolia.arbiscan.io/address/${contractAddress}`);
  if (deploymentTx) {
    console.log(`Transaction: https://sepolia.arbiscan.io/tx/${deploymentTx.hash}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });