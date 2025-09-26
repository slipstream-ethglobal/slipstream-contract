const hre = require("hardhat");

async function main() {
  console.log("Deploying TestnetUSDC contract...");

  // Get the deployer's address
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Check the deployer's balance
  const balance = await deployer.getBalance();
  console.log("Deployer balance:", hre.ethers.utils.formatEther(balance), "KDA");

  // Contract constructor parameters
  const tokenName = "Test USDC";
  const tokenSymbol = "TUSDC";
  const tokenDecimals = 6;

  // Deploy the contract
  const TestnetUSDC = await hre.ethers.getContractFactory("TestnetUSDC");
  const testUSDC = await TestnetUSDC.deploy(tokenName, tokenSymbol, tokenDecimals);

  await testUSDC.deployed();

  console.log("TestnetUSDC deployed to:", testUSDC.address);
  console.log("Token Name:", tokenName);
  console.log("Token Symbol:", tokenSymbol);
  console.log("Token Decimals:", tokenDecimals);

  // Wait for a few confirmations before verification
  console.log("Waiting for block confirmations...");
  await testUSDC.deployTransaction.wait(6);

  // Verify the contract on Blockscout
  try {
    console.log("Verifying contract...");
    await hre.run("verify:verify", {
      address: testUSDC.address,
      constructorArguments: [tokenName, tokenSymbol, tokenDecimals],
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.log("Contract verification failed:", error.message);
  }

  console.log(`
Deployment Summary:
==================
Contract Address: ${testUSDC.address}
Token Name: ${tokenName}
Token Symbol: ${tokenSymbol}
Decimals: ${tokenDecimals}
Initial Supply: 1,000,000 ${tokenSymbol}
Deployer: ${deployer.address}
Network: Kadena Chainweb EVM Testnet (Chain 20)
Block Explorer: https://chain-20.evm-testnet-blockscout.chainweb.com/address/${testUSDC.address}
`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });