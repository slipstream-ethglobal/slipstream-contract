const hre = require("hardhat");

async function main() {
  console.log("Deploying TestnetUSDC contract...");

  // Get the deployer's address
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Check the deployer's balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "KDA");

  // Contract constructor parameters
  const tokenName = "Test USDC";
  const tokenSymbol = "TUSDC";
  const tokenDecimals = 6;

  // Deploy the contract
  const TestnetUSDC = await hre.ethers.getContractFactory("TestnetUSDC");
  const testUSDC = await TestnetUSDC.deploy(tokenName, tokenSymbol, tokenDecimals);

  await testUSDC.waitForDeployment();

  console.log("TestnetUSDC deployed to:", await testUSDC.getAddress());
  console.log("Token Name:", tokenName);
  console.log("Token Symbol:", tokenSymbol);
  console.log("Token Decimals:", tokenDecimals);

  // Wait for a few confirmations before verification
  console.log("Waiting for block confirmations...");
  await testUSDC.deploymentTransaction().wait(6);

  // Get the contract address
  const contractAddress = await testUSDC.getAddress();

  // Verify the contract on Blockscout
  try {
    console.log("Verifying contract...");
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [tokenName, tokenSymbol, tokenDecimals],
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.log("Contract verification failed:", error.message);
  }

  console.log(`
Deployment Summary:
==================
Contract Address: ${contractAddress}
Token Name: ${tokenName}
Token Symbol: ${tokenSymbol}
Decimals: ${tokenDecimals}
Initial Supply: 1,000,000 ${tokenSymbol}
Deployer: ${deployer.address}
Network: Kadena Chainweb EVM Testnet (Chain 20)
Block Explorer: https://chain-20.evm-testnet-blockscout.chainweb.com/address/${contractAddress}
`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });