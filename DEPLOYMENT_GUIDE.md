# 🚀 Multi-Chain Deployment Guide

## 🌐 Supported Networks

### 1. **Kadena Testnet** (Chain ID: 5920)
- **RPC**: `https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/20/evm/rpc`
- **Explorer**: [Kadena Blockscout](https://chain-20.evm-testnet-blockscout.chainweb.com)
- **Supported Tokens**:
  - TestnetUSDC (TUSDC): `0x7EDfA2193d4c2664C9e0128Ae25Ae5c9eC72D365`

### 2. **Arbitrum Sepolia** (Chain ID: 421614)
- **RPC**: `https://sepolia-rollup.arbitrum.io/rpc`
- **Explorer**: [Arbiscan Sepolia](https://sepolia.arbiscan.io)
- **Supported Tokens**:
  - PayPal USD (PYUSD): `0x637A1259C6afd7E3AdF63993cA7E58BB438aB1B1`
  - Circle USDC: `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`

### 3. **Base Sepolia** (Chain ID: 84532)
- **RPC**: `https://sepolia.base.org`
- **Explorer**: [Basescan Sepolia](https://sepolia.basescan.org)
- **Supported Tokens**:
  - USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

## 🔧 Prerequisites

1. **Environment Setup**:
   ```bash
   # Ensure your .env file has the deployer private key
   DEPLOYER_PRIVATE_KEY=your_private_key_here
   ```

2. **Network Native Tokens** (for gas fees):
   - **Kadena**: KDA tokens from [Kadena Faucet](https://developer.kadena.io/tools/faucet)
   - **Arbitrum Sepolia**: ETH from [Arbitrum Faucet](https://faucet.quicknode.com/arbitrum/sepolia)
   - **Base Sepolia**: ETH from [Base Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)

3. **Dependencies**:
   ```bash
   yarn install
   yarn compile
   ```

## 🚀 Deployment Commands

### Individual Chain Deployments

```bash
# Deploy to Kadena Testnet
yarn deploy-kadena

# Deploy to Arbitrum Sepolia  
yarn deploy-arbitrum

# Deploy to Base Sepolia
yarn deploy-base
```

### All Chains at Once

```bash
# Deploy to all three chains sequentially
yarn deploy-all
```

## 📋 Deployment Process

Each deployment will:

1. ✅ **Check deployer balance** and account details
2. ✅ **Display supported tokens** for the target network
3. ✅ **Deploy SlipstreamGaslessProxy** with network-specific token addresses
4. ✅ **Set up initial configuration**:
   - Contract owner: Your deployer address
   - Initial relayer: Your deployer address
   - Supported tokens: Network-specific stablecoins/tokens
5. ✅ **Verify contract** on block explorer (where supported)
6. ✅ **Generate deployment summary** with all relevant links

## 📊 Expected Gas Costs

| Network | Deployment Gas | Approx. Cost (USD) |
|---------|---------------|-------------------|
| Kadena Testnet | ~1.8M gas | Free (testnet) |
| Arbitrum Sepolia | ~1.8M gas | Free (testnet) |
| Base Sepolia | ~1.8M gas | Free (testnet) |

## 🔍 Post-Deployment Verification

After deployment, the contract addresses will be displayed with:

1. **Block Explorer Links** for contract verification
2. **Transaction Hashes** for deployment tracking
3. **Supported Token Lists** for each network
4. **JSON Report** saved as `deployments.json`

## 📁 Generated Files

- `deployments.json` - Complete deployment report with all addresses and metadata
- Console output with all deployment details and explorer links

## 🎯 Contract Features

The deployed `SlipstreamGaslessProxy` contracts support:

- ✅ **ERC-2612 Permit Transactions** - Gasless approvals
- ✅ **Batch Processing** - Multiple transfers in one transaction
- ✅ **Multi-Token Support** - Network-specific stablecoin integration
- ✅ **Authorized Relayers** - Controlled access to gasless execution
- ✅ **Replay Protection** - Nonce-based security
- ✅ **Emergency Controls** - Pause/unpause functionality

## 🔐 Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Emergency stop mechanism
- **Access Control**: Owner-only administrative functions
- **Signature Validation**: EIP-712 compliant signatures
- **Nonce Management**: Prevents replay attacks

## 📚 Usage Examples

After deployment, you can interact with the contracts using:

1. **Ethers.js/Web3.js** for programmatic access
2. **Block Explorer** contract interaction tabs
3. **Custom frontend** integration
4. **API integrations** for gasless transaction processing

## 🎉 Success Indicators

A successful deployment will show:

```
✅ SlipstreamGaslessProxy deployed to: 0x...
🔗 Network: [Network Name] (Chain ID: [ID])
👤 Contract Owner: 0x...
🔄 Initial Relayers: [0x...]
🎯 Supported Tokens: [0x..., 0x...]
📋 Deployment tx hash: 0x...
🔍 Block Explorer: [explorer_link]
```

## 🚨 Important Notes

- **Testnet Only**: These deployments are for testing purposes
- **Private Keys**: Keep your deployer private key secure
- **Gas Fees**: Ensure sufficient native tokens for deployment
- **Token Addresses**: Verify token contract addresses before deployment
- **Network Configuration**: Ensure correct RPC endpoints in Hardhat config

## 🤝 Next Steps

1. **Test Integration**: Use deployed contracts with frontend/API
2. **Monitor Transactions**: Watch for successful gasless transfers
3. **Add More Tokens**: Call `updateTokenSupportStatus()` for additional tokens
4. **Set Up Relayers**: Call `updateRelayerAuthorizationStatus()` for production relayers
5. **Production Deployment**: Adapt for mainnet when ready