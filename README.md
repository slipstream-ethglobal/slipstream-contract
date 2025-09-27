# Slipstream Gasless Proxy Contracts

This repository contains the smart contracts for the Slipstream Gasless Proxy system, enabling gasless token transfers across multiple blockchain networks.

## 🚀 Deployed Contracts

### Arbitrum Sepolia (Testnet)
- **Contract Address**: `0xA6B0321Cc05672FF44F4E907A54465c0DEf74E77`
- **Chain ID**: 421614
- **Deployment Transaction**: [0x6f7e23baf8fa12967fceb3d7c1eb5ee9c36f3b92f47b50a20d65fe25b76e2472](https://sepolia.arbiscan.io/tx/0x6f7e23baf8fa12967fceb3d7c1eb5ee9c36f3b92f47b50a20d65fe25b76e2472)
- **Block Explorer**: [Arbiscan](https://sepolia.arbiscan.io/address/0xA6B0321Cc05672FF44F4E907A54465c0DEf74E77)
- **Gas Used**: 1,867,559

### Kadena Testnet (Chain 20)
- **Contract Address**: `0xDaDbcb45964551DD45c0917029CC21882d31EC3B`
- **Chain ID**: 5920
- **Block Explorer**: [Kadena Blockscout](https://chain-20.evm-testnet-blockscout.chainweb.com/address/0xDaDbcb45964551DD45c0917029CC21882d31EC3B)

### TestnetUSDC Token Contract (Kadena)
- **Token Address**: `0x7EDfA2193d4c2664C9e0128Ae25Ae5c9eC72D365`
- **Token Contract**: [Blockscout](https://chain-20.evm-testnet-blockscout.chainweb.com/token/0x7EDfA2193d4c2664C9e0128Ae25Ae5c9eC72D365?tab=contract)
- **Symbol**: TUSDC
- **Decimals**: 6
- **Type**: Custom ERC-20 test token for Kadena EVM testnet

## 🎯 Supported Tokens

### Arbitrum Sepolia
- **PayPal USD (PYUSD)**: `0x637A1259C6afd7E3AdF63993cA7E58BB438aB1B1`
- **Circle USDC**: `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`

### Kadena Testnet
- **TestnetUSDC (TUSDC)**: `0x7EDfA2193d4c2664C9e0128Ae25Ae5c9eC72D365`
  - **Token Contract**: [Blockscout](https://chain-20.evm-testnet-blockscout.chainweb.com/token/0x7EDfA2193d4c2664C9e0128Ae25Ae5c9eC72D365?tab=contract)
  - **Symbol**: TUSDC
  - **Decimals**: 6
  - **Type**: Custom test token for Kadena EVM testnet

## 📋 Contract Features

The SlipstreamGaslessProxy contract enables:

- **Gasless Token Transfers**: Users can transfer tokens without paying gas fees
- **ERC-2612 Permit Support**: Leverages permit functionality for seamless approvals
- **Multi-Token Support**: Supports various ERC-20 tokens with permit functionality
- **Relayer Network**: Decentralized relayer system for processing transactions
- **Fee Management**: Configurable relayer fees for sustainable operations
- **Nonce Management**: Prevents replay attacks with proper nonce handling

## 🛠️ Development Setup

### Prerequisites
- Node.js (v16 or higher)
- Yarn or npm
- Hardhat
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd slipstream-contract

# Install dependencies
yarn install
# or
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
# Deployer private key (without 0x prefix)
DEPLOYER_PRIVATE_KEY=your_private_key_here

# RPC URLs
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
KADENA_TESTNET_RPC_URL=https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet

# Block Explorer API Keys (optional)
ARBISCAN_API_KEY=your_arbiscan_api_key
KADENA_BLOCKSCOUT_API_KEY=your_blockscout_api_key
```

## 🚀 Deployment

### Deploy to Arbitrum Sepolia

```bash
yarn deploy-arbitrum
# or
npx hardhat run scripts/deploy-arbitrum-sepolia.js --network arbitrum_sepolia
```

### Deploy to Kadena Testnet

```bash
yarn deploy-kadena
# or
npx hardhat run scripts/deploy-slipstream.js --chainweb
```

### Deploy to Base Sepolia

```bash
yarn deploy-base
# or
npx hardhat run scripts/deploy-base-sepolia.js --network base_sepolia
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
yarn test

# Run specific test file
yarn test test/Splitstream.test.js

# Run tests with gas reporting
yarn test --gas-report
```

## 📁 Project Structure

```
slipstream-contract/
├── contracts/
│   ├── splitstream.sol          # Main gasless proxy contract
│   ├── testUSDC.sol             # Test USDC token for Kadena
│   └── ERC20.sol                # ERC-20 interface
├── scripts/
│   ├── deploy-arbitrum-sepolia.js
│   ├── deploy-base-sepolia.js
│   ├── deploy-slipstream.js
│   └── deploy-all-chains.js
├── test/
│   ├── Splitstream.test.js
│   └── TestnetUSDC.test.js
├── hardhat.config.js
├── package.json
└── README.md
```

## 🔧 Configuration

### Network Configuration

The project supports multiple networks:

- **Arbitrum Sepolia**: Testnet for Arbitrum L2
- **Base Sepolia**: Testnet for Base L2  
- **Kadena Testnet**: Kadena's EVM-compatible testnet

### Token Configuration

Each deployment includes specific token addresses for the target network:

- **Arbitrum Sepolia**: PYUSD and Circle USDC
- **Kadena Testnet**: TestnetUSDC (custom test token)

## 🔍 Verification

Contracts are automatically verified on block explorers after deployment:

- **Arbitrum Sepolia**: [Arbiscan](https://sepolia.arbiscan.io/)
- **Kadena Testnet**: [Blockscout](https://chain-20.evm-testnet-blockscout.chainweb.com/)

## 📊 Gas Usage

| Contract | Network | Gas Used | Gas Price | Total Cost |
|----------|---------|----------|-----------|------------|
| SlipstreamGaslessProxy | Arbitrum Sepolia | 1,867,559 | ~0.1 gwei | ~0.0002 ETH |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in this repository
- Join our Discord community
- Check the documentation in the `/docs` folder

## 🔗 Related Projects

- [Slipstream Relayer](../slipstream-relayer/) - Backend relayer service
- [Slipstream Frontend](../slipstream-frontend/) - Web interface
- [Slipstream SDK](../slipstream-sdk/) - JavaScript SDK

---

**Note**: This is a testnet deployment. Do not use in production without proper security audits and mainnet deployment procedures.