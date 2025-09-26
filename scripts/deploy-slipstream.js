const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying SlipstreamGaslessProxy to Kadena Testnet...\n");

  // Get the deployer's address
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Deploying with account: ${deployer.address}`);

  // Check the deployer's balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${hre.ethers.formatEther(balance)} KDA\n`);

  // Kadena testnet USDC address (our deployed TestnetUSDC)
  const TESTNET_USDC_ADDRESS = "0x7EDfA2193d4c2664C9e0128Ae25Ae5c9eC72D365";
  
  console.log("🎯 Supported tokens:");
  console.log(`   - TestnetUSDC (TUSDC): ${TESTNET_USDC_ADDRESS}\n`);
  
  // Deploy the SlipstreamGaslessProxy contract
  console.log("⏳ Deploying contract...");
  const SlipstreamGaslessProxy = await hre.ethers.getContractFactory("SlipstreamGaslessProxy");
  const gaslessProxy = await SlipstreamGaslessProxy.deploy(
    deployer.address,        // contractOwnerAddress
    [deployer.address],      // initialRelayerAddresses
    [TESTNET_USDC_ADDRESS]   // initialSupportedTokens
  );

  await gaslessProxy.waitForDeployment();
  const contractAddress = await gaslessProxy.getAddress();

  console.log(`✅ SlipstreamGaslessProxy deployed to: ${contractAddress}`);
  console.log(`🔗 Network: Kadena Testnet (Chain ID: 5920)`);
  console.log(`👤 Contract Owner: ${deployer.address}`);
  console.log(`🔄 Initial Relayers: [${deployer.address}]`);
  console.log(`🎯 Supported Tokens: [${TESTNET_USDC_ADDRESS}]`);

  // Get deployment transaction details
  const deploymentTx = gaslessProxy.deploymentTransaction();
  if (deploymentTx) {
    console.log(`📋 Deployment tx hash: ${deploymentTx.hash}`);
  }

  // Wait for a few confirmations before verification
  console.log("\n⏳ Waiting for block confirmations...");
  await gaslessProxy.deploymentTransaction().wait(6);

  // Verify the contract on Blockscout
  try {
    console.log("🔍 Verifying contract...");
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [
        deployer.address,
        [deployer.address], 
        [TESTNET_USDC_ADDRESS]
      ],
    });
    console.log("✅ Contract verified successfully!");
  } catch (error) {
    console.log(`❌ Contract verification failed: ${error.message}`);
  }

  console.log(`
📊 DEPLOYMENT SUMMARY
${"=".repeat(60)}
✅ SlipstreamGaslessProxy: ${contractAddress}
🎯 TestnetUSDC Address: ${TESTNET_USDC_ADDRESS}
👤 Owner: ${deployer.address}
🔄 Initial Relayer: ${deployer.address}
🔗 Network: Kadena Testnet (Chain ID: 5920)
📋 Transaction: ${deploymentTx?.hash || 'N/A'}
🔍 Block Explorer: https://chain-20.evm-testnet-blockscout.chainweb.com/address/${contractAddress}

🎉 Ready to process gasless transactions!
`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });