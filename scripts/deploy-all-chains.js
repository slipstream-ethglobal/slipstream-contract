const hre = require("hardhat");

// Token addresses for each chain
const CHAIN_CONFIGS = {
  kadena_testnet: {
    name: "Kadena Testnet",
    chainId: 5920,
    tokens: [
      {
        name: "TestnetUSDC (Our Contract)",
        address: "0x7EDfA2193d4c2664C9e0128Ae25Ae5c9eC72D365"
      }
    ]
  },
  arbitrum_sepolia: {
    name: "Arbitrum Sepolia",
    chainId: 421614,
    tokens: [
      {
        name: "PayPal USD (PYUSD)",
        address: "0x637A1259C6afd7E3AdF63993cA7E58BB438aB1B1"
      },
      {
        name: "Circle USDC",
        address: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"
      }
    ]
  },
  base_sepolia: {
    name: "Base Sepolia",
    chainId: 84532,
    tokens: [
      {
        name: "USDC",
        address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
      }
    ]
  }
};

async function deployToChain(networkName) {
  console.log(`\n🚀 Deploying SlipstreamGaslessProxy to ${CHAIN_CONFIGS[networkName].name}...`);
  
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Deploying with account: ${deployer.address}`);
  
  // Get balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${hre.ethers.formatEther(balance)} ETH`);
  
  // Get the contract factory
  const SlipstreamGaslessProxy = await hre.ethers.getContractFactory("SlipstreamGaslessProxy");
  
  const chainConfig = CHAIN_CONFIGS[networkName];
  const supportedTokens = chainConfig.tokens.map(token => token.address);
  
  console.log(`🎯 Supported tokens for ${chainConfig.name}:`);
  chainConfig.tokens.forEach(token => {
    console.log(`   - ${token.name}: ${token.address}`);
  });
  
  // Deploy the contract
  const contract = await SlipstreamGaslessProxy.deploy(
    deployer.address,      // contractOwnerAddress
    [deployer.address],    // initialRelayerAddresses (deployer as initial relayer)
    supportedTokens        // initialSupportedTokens
  );
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  
  console.log(`✅ SlipstreamGaslessProxy deployed to: ${contractAddress}`);
  console.log(`🔗 Chain: ${chainConfig.name} (Chain ID: ${chainConfig.chainId})`);
  
  // Get deployment transaction details
  const deploymentTx = contract.deploymentTransaction();
  if (deploymentTx) {
    console.log(`📋 Deployment tx hash: ${deploymentTx.hash}`);
    console.log(`⛽ Gas used: ${deploymentTx.gasLimit ? deploymentTx.gasLimit.toString() : 'N/A'}`);
  }
  
  return {
    network: networkName,
    chainName: chainConfig.name,
    chainId: chainConfig.chainId,
    address: contractAddress,
    supportedTokens: chainConfig.tokens,
    txHash: deploymentTx?.hash
  };
}

async function main() {
  console.log("🌐 Multi-Chain SlipstreamGaslessProxy Deployment");
  console.log("=" .repeat(60));
  
  const deployments = [];
  
  // Deploy to each network
  for (const networkName of Object.keys(CHAIN_CONFIGS)) {
    try {
      // Switch to the network
      hre.changeNetwork(networkName);
      
      const deployment = await deployToChain(networkName);
      deployments.push(deployment);
      
    } catch (error) {
      console.error(`❌ Failed to deploy to ${networkName}:`, error.message);
      deployments.push({
        network: networkName,
        chainName: CHAIN_CONFIGS[networkName].name,
        error: error.message
      });
    }
  }
  
  // Print deployment summary
  console.log("\n📊 DEPLOYMENT SUMMARY");
  console.log("=" .repeat(60));
  
  deployments.forEach(deployment => {
    console.log(`\n🔸 ${deployment.chainName} (${deployment.network})`);
    if (deployment.address) {
      console.log(`   ✅ Contract: ${deployment.address}`);
      console.log(`   🔗 Chain ID: ${deployment.chainId}`);
      if (deployment.txHash) {
        console.log(`   📋 Tx Hash: ${deployment.txHash}`);
      }
      console.log(`   🎯 Supported Tokens:`);
      deployment.supportedTokens.forEach(token => {
        console.log(`      - ${token.name}: ${token.address}`);
      });
    } else {
      console.log(`   ❌ Error: ${deployment.error}`);
    }
  });
  
  // Generate deployment report
  const report = {
    timestamp: new Date().toISOString(),
    deployments: deployments
  };
  
  console.log(`\n📁 Deployment report saved to deployments.json`);
  require('fs').writeFileSync(
    'deployments.json', 
    JSON.stringify(report, null, 2)
  );
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { deployToChain, CHAIN_CONFIGS };