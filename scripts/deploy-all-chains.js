const { spawn } = require('child_process');
const fs = require('fs');

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
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Deploying SlipstreamGaslessProxy to ${CHAIN_CONFIGS[networkName].name}...`);
    
    // Determine which script to use based on network
    let scriptPath;
    switch(networkName) {
      case 'kadena_testnet':
        scriptPath = 'scripts/deploy-slipstream.js';
        break;
      case 'arbitrum_sepolia':
        scriptPath = 'scripts/deploy-arbitrum-sepolia.js';
        break;
      case 'base_sepolia':
        scriptPath = 'scripts/deploy-base-sepolia.js';
        break;
      default:
        return reject(new Error(`Unknown network: ${networkName}`));
    }

    // Run hardhat deployment command
    const deployCommand = spawn('npx', [
      'hardhat', 
      'run', 
      scriptPath, 
      '--network', 
      networkName
    ], {
      stdio: 'pipe',
      cwd: process.cwd()
    });

    let stdout = '';
    let stderr = '';

    deployCommand.stdout.on('data', (data) => {
      stdout += data.toString();
      process.stdout.write(data); // Show real-time output
    });

    deployCommand.stderr.on('data', (data) => {
      stderr += data.toString();
      process.stderr.write(data); // Show real-time errors
    });

    deployCommand.on('close', (code) => {
      if (code === 0) {
        // Try to extract contract address from output
        const addressMatch = stdout.match(/deployed to: (0x[a-fA-F0-9]{40})/);
        const txHashMatch = stdout.match(/tx hash: (0x[a-fA-F0-9]{64})/);
        
        resolve({
          network: networkName,
          chainName: CHAIN_CONFIGS[networkName].name,
          chainId: CHAIN_CONFIGS[networkName].chainId,
          address: addressMatch ? addressMatch[1] : 'Address not found in output',
          supportedTokens: CHAIN_CONFIGS[networkName].tokens,
          txHash: txHashMatch ? txHashMatch[1] : 'Tx hash not found',
          success: true
        });
      } else {
        reject(new Error(`Deployment failed with exit code ${code}: ${stderr || stdout}`));
      }
    });

    deployCommand.on('error', (error) => {
      reject(new Error(`Failed to start deployment: ${error.message}`));
    });
  });
}

async function main() {
  console.log("🌐 Multi-Chain SlipstreamGaslessProxy Deployment");
  console.log("=" .repeat(60));
  
  const deployments = [];
  
  // Deploy to each network sequentially
  for (const networkName of Object.keys(CHAIN_CONFIGS)) {
    try {
      const deployment = await deployToChain(networkName);
      deployments.push(deployment);
      
      // Add a small delay between deployments
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Failed to deploy to ${networkName}:`, error.message);
      deployments.push({
        network: networkName,
        chainName: CHAIN_CONFIGS[networkName].name,
        error: error.message,
        success: false
      });
    }
  }
  
  // Print deployment summary
  console.log("\n📊 DEPLOYMENT SUMMARY");
  console.log("=" .repeat(60));
  
  deployments.forEach(deployment => {
    console.log(`\n🔸 ${deployment.chainName} (${deployment.network})`);
    if (deployment.success && deployment.address) {
      console.log(`   ✅ Contract: ${deployment.address}`);
      console.log(`   🔗 Chain ID: ${deployment.chainId}`);
      if (deployment.txHash && deployment.txHash !== 'Tx hash not found') {
        console.log(`   📋 Tx Hash: ${deployment.txHash}`);
      }
      console.log(`   🎯 Supported Tokens:`);
      deployment.supportedTokens.forEach(token => {
        console.log(`      - ${token.name}: ${token.address}`);
      });
      
      // Add explorer links
      let explorerUrl = '';
      switch(deployment.network) {
        case 'kadena_testnet':
          explorerUrl = `https://chain-20.evm-testnet-blockscout.chainweb.com/address/${deployment.address}`;
          break;
        case 'arbitrum_sepolia':
          explorerUrl = `https://sepolia.arbiscan.io/address/${deployment.address}`;
          break;
        case 'base_sepolia':
          explorerUrl = `https://sepolia.basescan.org/address/${deployment.address}`;
          break;
      }
      if (explorerUrl) {
        console.log(`   🔍 Explorer: ${explorerUrl}`);
      }
    } else {
      console.log(`   ❌ Error: ${deployment.error}`);
    }
  });
  
  // Generate deployment report
  const report = {
    timestamp: new Date().toISOString(),
    deployments: deployments
  };
  
  fs.writeFileSync('deployments.json', JSON.stringify(report, null, 2));
  console.log(`\n📁 Deployment report saved to deployments.json`);
  
  // Summary statistics
  const successful = deployments.filter(d => d.success).length;
  const failed = deployments.length - successful;
  
  console.log(`\n📈 DEPLOYMENT STATISTICS:`);
  console.log(`   ✅ Successful: ${successful}/${deployments.length}`);
  console.log(`   ❌ Failed: ${failed}/${deployments.length}`);
  
  if (successful > 0) {
    console.log(`\n🎉 Successfully deployed to ${successful} network${successful > 1 ? 's' : ''}!`);
  }
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