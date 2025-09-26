// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title TestnetUSDC
 * @dev ERC20 token with ERC2612 permit functionality for gasless transactions
 * Includes USDC-like features: blacklisting, pausing, minting/burning
 */
contract TestnetUSDC is ERC20, ERC20Permit, Ownable, Pausable {
    // State variables
    mapping(address => bool) public blacklisted;
    uint8 private _decimals;
    
    // Events
    event Blacklisted(address indexed account);
    event Unblacklisted(address indexed account);

    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        uint8 tokenDecimals
    ) ERC20(tokenName, tokenSymbol) ERC20Permit(tokenName) Ownable(msg.sender) {
        _decimals = tokenDecimals;
        // Mint initial supply to deployer for testing
        _mint(msg.sender, 1000000 * 10**tokenDecimals);
    }

    // Override decimals to return custom value
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    // Pausable functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Blacklist functions
    function blacklist(address account) external onlyOwner {
        require(account != address(0), "Cannot blacklist zero address");
        blacklisted[account] = true;
        emit Blacklisted(account);
    }

    function unblacklist(address account) external onlyOwner {
        blacklisted[account] = false;
        emit Unblacklisted(account);
    }

    // Check if account is blacklisted
    function isBlacklisted(address account) external view returns (bool) {
        return blacklisted[account];
    }

    // Hook to prevent transfers from/to blacklisted accounts
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        require(!blacklisted[from], "TestnetUSDC: sender blacklisted");
        require(!blacklisted[to], "TestnetUSDC: recipient blacklisted");
        super._update(from, to, amount);
    }

    // Mint function - useful for testing
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        _mint(to, amount);
    }

    // Burn function
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    // Burn from specific account (owner only)
    function burnFrom(address account, uint256 amount) external onlyOwner {
        _burn(account, amount);
    }

    // Faucet function for easy testing (remove in production!)
    function faucet(address to, uint256 amount) external {
        require(to != address(0), "Cannot mint to zero address");
        require(amount <= 10000 * 10**_decimals, "Faucet limit exceeded");
        _mint(to, amount);
    }
}