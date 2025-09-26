require("@nomicfoundation/hardhat-toolbox");
require("@kadena/hardhat-chainweb");
require("dotenv/config");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  defaultChainweb: "testnet",

  chainweb: {
    hardhat: { chains: 2 },
    
    testnet: {
      type: 'external',
      chains: 1,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainIdOffset: 5920,
      chainwebChainIdOffset: 20,
      externalHostUrl: "https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet",
      etherscan: {
        apiKey: 'abc', // Any non-empty string works for Blockscout
        apiURLTemplate: "http://chain-{cid}.evm-testnet-blockscout.chainweb.com/api/",
        browserURLTemplate: "http://chain-{cid}.evm-testnet-blockscout.chainweb.com"
      },
    },
  },

  networks: {
    kadena_testnet: {
      url: "https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/20/evm/rpc",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 5920,
    },
  },
};