# TestnetUSDC - Kadena Chainweb EVM Testnet

A comprehensive ERC20 token implementation with USDC-like features, deployed on Kadena Chainweb EVM Testnet Chain 20.

## 📋 Contract Information

- **Contract Address**: `0x7EDfA2193d4c2664C9e0128Ae25Ae5c9eC72D365`
- **Network**: Kadena Chainweb EVM Testnet (Chain 20)
- **Chain ID**: 20
- **Token Name**: Test USDC
- **Token Symbol**: TUSDC
- **Decimals**: 6
- **Initial Supply**: 1,000,000 TUSDC

## 🔍 Block Explorer

View the contract on Blockscout: [Contract Details](https://chain-20.evm-testnet-blockscout.chainweb.com/address/0x7EDfA2193d4c2664C9e0128Ae25Ae5c9eC72D365)

## ✨ Features

### Core ERC20 Features
- ✅ Standard ERC20 functionality (transfer, approve, transferFrom)
- ✅ ERC2612 Permit functionality for gasless transactions
- ✅ Custom decimals support (6 decimals, like USDC)

### Administrative Features
- ✅ **Pausable**: Owner can pause/unpause all transfers
- ✅ **Blacklisting**: Owner can blacklist/unblacklist addresses
- ✅ **Minting**: Owner can mint new tokens
- ✅ **Burning**: Users can burn their own tokens, owner can burn from any account

### Testing Features
- ✅ **Faucet Function**: Anyone can request up to 10,000 TUSDC (for testing purposes)
- ✅ **Initial Supply**: 1M tokens minted to deployer on creation

## 🚀 Quick Start

### Prerequisites

- Node.js v16 or higher
- npm or yarn
- EVM-compatible wallet (MetaMask recommended)
- Testnet KDA tokens for gas fees

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd slipstream-contract

# Install dependencies
npm install

# Copy environment file and add your private key
cp .env.example .env
# Edit .env and add your DEPLOYER_PRIVATE_KEY
```

### Compile Contract

```bash
npm run compile
```

### Run Tests

```bash
npm test
```

### Deploy Contract

```bash
# Deploy using Kadena Hardhat plugin
npm run deploy

# Or deploy directly to kadena testnet
npm run deploy-kadena
```

## 🔧 Contract Interaction

### Adding to MetaMask

1. **Add Kadena Chainweb EVM Testnet to MetaMask:**
   - Network Name: `Kadena Chainweb EVM Testnet 20`
   - RPC URL: `https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/20/evm/rpc`
   - Chain ID: `5920`
   - Currency Symbol: `KDA`
   - Block Explorer: `https://chain-20.evm-testnet-blockscout.chainweb.com`

2. **Add Token to MetaMask:**
   - Token Contract Address: `0x7EDfA2193d4c2664C9e0128Ae25Ae5c9eC72D365`
   - Token Symbol: `TUSDC`
   - Token Decimals: `6`

### Using the Faucet

The contract includes a public faucet function for easy testing:

```solidity
// Request 1000 TUSDC tokens (anyone can call this)
faucet(your_address, 1000000000); // 1000 tokens with 6 decimals
```

**Note**: Faucet is limited to 10,000 TUSDC per request.

### Key Functions

#### Public Functions
```solidity
// Standard ERC20
transfer(to, amount)
approve(spender, amount)
transferFrom(from, to, amount)

// Burn your own tokens
burn(amount)

// Faucet (testing only)
faucet(to, amount) // Max 10,000 TUSDC per call

// View functions
balanceOf(account)
isBlacklisted(account)
```

#### Owner-Only Functions
```solidity
// Minting
mint(to, amount)

// Blacklisting
blacklist(account)
unblacklist(account)

// Pausing
pause()
unpause()

// Burning from any account
burnFrom(account, amount)
```

## 🧪 Testing

The contract includes comprehensive tests covering:

- ✅ Deployment and initialization
- ✅ Standard ERC20 transfers
- ✅ Blacklisting functionality
- ✅ Faucet limits and functionality
- ✅ Pausable features
- ✅ Administrative functions

Run tests with:
```bash
npm test
```

## 📄 Contract Source

The main contract file is located at: `contracts/testUSDC.sol`

Key dependencies:
- OpenZeppelin Contracts v5.x
- Solidity ^0.8.0

## 🔐 Security Features

1. **Access Control**: Uses OpenZeppelin's `Ownable` for administrative functions
2. **Pausable**: Can halt all transfers in emergency situations  
3. **Blacklisting**: Prevents transfers from/to blacklisted addresses
4. **Safe Math**: Built-in overflow protection in Solidity 0.8+
5. **ERC2612 Permits**: Enables gasless approvals using signatures

## ⚠️ Important Notes

### For Production Use
- Remove or restrict the `faucet()` function
- Implement proper governance for admin functions
- Consider using a multisig wallet for contract ownership
- Audit the contract thoroughly

### Testnet Limitations
- This is a testnet deployment for development and testing only
- Tokens have no monetary value
- The faucet function is included for easy testing

## 🌐 Network Information

### Kadena Chainweb EVM Testnet Chain 20
- **RPC URL**: https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/20/evm/rpc
- **Chain ID**: 5920
- **Block Explorer**: https://chain-20.evm-testnet-blockscout.chainweb.com
- **Faucet**: https://developer.kadena.io/tools/faucet

### Gas Costs (Approximate)
- Transfer: ~60,000 gas
- Mint: ~60,000 gas
- Blacklist: ~47,000 gas
- Deploy: ~1,540,000 gas

## 📚 Additional Resources

- [Kadena Documentation](https://docs.kadena.io/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [ERC20 Standard](https://eips.ethereum.org/EIPS/eip-20)
- [ERC2612 Permits](https://eips.ethereum.org/EIPS/eip-2612)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**⚠️ Disclaimer**: This is a testnet deployment for development purposes only. Do not use this contract with real funds on mainnet without proper security audits and modifications.

- A simple Hardhat configuration file.
- Foundry-compatible Solidity unit tests.
- TypeScript integration tests using `mocha` and ethers.js
- Examples demonstrating how to connect to different types of networks, including locally simulating OP mainnet.

## Usage

### Running Tests

To run all the tests in the project, execute the following command:

```shell
npx hardhat test
```

You can also selectively run the Solidity or `mocha` tests:

```shell
npx hardhat test solidity
npx hardhat test mocha
```

### Make a deployment to Sepolia

This project includes an example Ignition module to deploy the contract. You can deploy this module to a locally simulated chain or to Sepolia.

To run the deployment to a local chain:

```shell
npx hardhat ignition deploy ignition/modules/Counter.ts
```

To run the deployment to Sepolia, you need an account with funds to send the transaction. The provided Hardhat configuration includes a Configuration Variable called `SEPOLIA_PRIVATE_KEY`, which you can use to set the private key of the account you want to use.

You can set the `SEPOLIA_PRIVATE_KEY` variable using the `hardhat-keystore` plugin or by setting it as an environment variable.

To set the `SEPOLIA_PRIVATE_KEY` config variable using `hardhat-keystore`:

```shell
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
```

After setting the variable, you can run the deployment with the Sepolia network:

```shell
npx hardhat ignition deploy --network sepolia ignition/modules/Counter.ts
```
