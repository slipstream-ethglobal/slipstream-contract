const hre = require("hardhat");

async function main() {
  console.log("Deploying SlipstreamGaslessProxy contract...");

  // Get the deployer's address
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Check the deployer's balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "KDA");

  // Get TestnetUSDC address (already deployed)
  const testUSDCAddress = "0x7EDfA2193d4c2664C9e0128Ae25Ae5c9eC72D365";
  
  // Deploy the SlipstreamGaslessProxy contract
  const SlipstreamGaslessProxy = await hre.ethers.getContractFactory("SlipstreamGaslessProxy");
  const gaslessProxy = await SlipstreamGaslessProxy.deploy(
    deployer.address, // contract owner
    [deployer.address], // initial relayers (deployer as first relayer)
    [testUSDCAddress] // supported tokens (our TestnetUSDC)
  );

  await gaslessProxy.waitForDeployment();
  const contractAddress = await gaslessProxy.getAddress();

  console.log("SlipstreamGaslessProxy deployed to:", contractAddress);
  console.log("Contract Owner:", deployer.address);
  console.log("Initial Relayers:", [deployer.address]);
  console.log("Supported Tokens:", [testUSDCAddress]);

  // Wait for a few confirmations before verification
  console.log("Waiting for block confirmations...");
  await gaslessProxy.deploymentTransaction().wait(6);

  // Verify the contract on Blockscout
  try {
    console.log("Verifying contract...");
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [
        deployer.address,
        [deployer.address], 
        [testUSDCAddress]
      ],
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.log("Contract verification failed:", error.message);
  }

  console.log(`
Deployment Summary:
==================
SlipstreamGaslessProxy Address: ${contractAddress}
TestnetUSDC Address: ${testUSDCAddress}
Owner: ${deployer.address}
Initial Relayer: ${deployer.address}
Network: Kadena Chainweb EVM Testnet (Chain 20)
Block Explorer: https://chain-20.evm-testnet-blockscout.chainweb.com/address/${contractAddress}

Ready to process gasless transactions! 🚀
`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });