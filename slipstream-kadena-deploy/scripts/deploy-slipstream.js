const { chainweb } = require('hardhat');

async function main() {
  const verificationDelay = process.env.VERIFICATION_DELAY
    ? parseInt(process.env.VERIFICATION_DELAY)
    : 10000; // Default 10 seconds

  console.log("🚀 Deploying SlipstreamGaslessProxy to Kadena Testnet (Chain ID: 5920)...\n");

  // Make sure we're on the first chainweb chain (5920)
  const chains = await chainweb.getChainIds();
  await chainweb.switchChain(chains[0]);
  const [deployer] = await ethers.getSigners();

  console.log(
    `Deploying contracts with deployer account: ${deployer.address} on network: ${network.name}`,
  );

  // Check the deployer's balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} KDA\n`);

  // Kadena testnet USDC address (our deployed TestnetUSDC)
  const TESTNET_USDC_ADDRESS = "0x7EDfA2193d4c2664C9e0128Ae25Ae5c9eC72D365";
  
  console.log("🎯 Supported tokens:");
  console.log(`   - TestnetUSDC (TUSDC): ${TESTNET_USDC_ADDRESS}\n`);

  // Deploy the SlipstreamGaslessProxy contract using Chainweb
  console.log("⏳ Deploying contract...");
  const deployed = await chainweb.deployContractOnChains({
    name: 'SlipstreamGaslessProxy',
    constructorArgs: [
      deployer.address,        // contractOwnerAddress
      [deployer.address],      // initialRelayerAddresses
      [TESTNET_USDC_ADDRESS]   // initialSupportedTokens
    ],
  });

  if (deployed.deployments.length === 0) {
    console.log('❌ No contracts deployed');
    return;
  }
  console.log('✅ Contracts deployed');

  // Filter out failed deployments
  const successfulDeployments = deployed.deployments.filter((d) => d !== null);

  if (successfulDeployments.length > 0) {
    console.log(
      `✅ Contracts successfully deployed to ${successfulDeployments.length} chain(s)`,
    );

    // Create a map of deployments by chain ID for easy lookup
    const deploymentsByChain = {};
    for (const deployment of successfulDeployments) {
      deploymentsByChain[deployment.chain] = deployment;
    }

    // Process deployments using runOverChains for consistency
    await chainweb.runOverChains(async (chainId) => {
      // Skip chains that weren't in our successful deployments
      if (!deploymentsByChain[chainId]) {
        console.log(
          `No deployment for chain ${chainId}, skipping verification`,
        );
        return;
      }

      const deployment = deploymentsByChain[chainId];

      // Access deployment information
      const contractAddress = deployment.address;

      console.log(`✅ SlipstreamGaslessProxy deployed to: ${contractAddress}`);
      console.log(`🔗 Network: Kadena Testnet (Chain ID: ${chainId})`);
      console.log(`👤 Contract Owner: ${deployer.address}`);
      console.log(`🔄 Initial Relayers: [${deployer.address}]`);
      console.log(`🎯 Supported Tokens: [${TESTNET_USDC_ADDRESS}]`);

      // Get deployment transaction details
      const deploymentTx = deployment.transaction;
      if (deploymentTx) {
        console.log(`📋 Deployment tx hash: ${deploymentTx.hash}`);
      }

      console.log(
        `Verifying contract with address ${contractAddress} on chain ${chainId}...`,
      );

      // Check if we're on a local network
      const isLocalNetwork =
        network.name.includes('hardhat') || network.name.includes('localhost');

      // Skip verification for local networks
      if (isLocalNetwork) {
        console.log(
          `Skipping contract verification for local network: ${network.name}`,
        );
      } else {
        try {
          console.log(
            `Waiting ${verificationDelay / 1000} seconds before verification...`,
          );

          // Optional delay for verification API to index the contract
          if (verificationDelay > 0) {
            await new Promise((resolve) =>
              setTimeout(resolve, verificationDelay),
            );
          }

          console.log(`🔍 Attempting to verify contract on chain ${chainId}...`);
          await run('verify:verify', {
            address: contractAddress,
            constructorArguments: [
              deployer.address,
              [deployer.address], 
              [TESTNET_USDC_ADDRESS]
            ],
            force: true,
          });

          console.log(`✅ Contract successfully verified on chain ${chainId}`);
        } catch (verifyError) {
          console.error(
            `❌ Error verifying contract on chain ${chainId}:`,
            verifyError.message,
          );
        }
      }

      console.log(`
📊 DEPLOYMENT SUMMARY
${"=".repeat(60)}
✅ SlipstreamGaslessProxy: ${contractAddress}
🎯 TestnetUSDC Address: ${TESTNET_USDC_ADDRESS}
👤 Owner: ${deployer.address}
🔄 Initial Relayer: ${deployer.address}
🔗 Network: Kadena Testnet (Chain ID: ${chainId})
📋 Transaction: ${deploymentTx?.hash || 'N/A'}
🔍 Block Explorer: https://chain-20.evm-testnet-blockscout.chainweb.com/address/${contractAddress}

🎉 Ready to process gasless transactions!
`);

      // Log all deployments
      deployed.deployments.forEach(async (deployment) => {
        console.log(`${deployment.address} on ${deployment.chain}`);
      });
    });
  }
}

main()
  .then(() => process.exit(0)) // Exiting the process if deployment is successful.
  .catch((error) => {
    console.error(error); // Logging any errors encountered during deployment.
    process.exit(1); // Exiting the process with an error code.
  });