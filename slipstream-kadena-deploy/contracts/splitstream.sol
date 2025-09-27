// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title SlipstreamGaslessProxy
 * @dev Advanced gasless transaction relay system for ERC20 tokens
 * @notice Zero-gas transactions for end users - relayer network covers gas expenses
 * @notice Full support for standard transfers and ERC2612 permit-based operations
 */
contract SlipstreamGaslessProxy is Ownable, ReentrancyGuard, Pausable {
    using ECDSA for bytes32;

    // EIP-712 domain separator constants for signature verification
    bytes32 private constant EIP712_DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );
    
    bytes32 private constant GASLESS_TRANSFER_TYPEHASH = keccak256(
        "Transfer(address from,address to,address token,uint256 amount,uint256 relayerFee,uint256 nonce,uint256 deadline)"
    );

    bytes32 public immutable CONTRACT_DOMAIN_SEPARATOR;
    
    // State management and security mappings
    mapping(address => uint256) public userNonceCounter;
    mapping(bytes32 => bool) public completedTransactionHashes;
    mapping(address => bool) public whitelistedRelayerAddresses;
    mapping(address => bool) public allowedTokenContracts;
    
    // Transaction fee configuration managed by backend services
    
    struct GaslessTransactionRequest {
        address fromAddress;        // Token holder initiating the transfer
        address toAddress;          // Destination address for token transfer  
        address tokenContract;      // ERC20 token contract address
        uint256 transferAmount;     // Quantity of tokens to transfer
        uint256 relayerServiceFee;  // Compensation for relayer service (in same token)
        uint256 transactionNonce;   // Sender's nonce for replay attack prevention
        uint256 expirationDeadline; // Timestamp after which signature becomes invalid
    }
    
    struct ERC2612PermitSignature {
        uint256 approvalValue;      // Total amount approved via permit
        uint256 permitDeadline;     // Permit expiration timestamp
        uint8 signatureV;           // ECDSA signature parameter v
        bytes32 signatureR;         // ECDSA signature parameter r
        bytes32 signatureS;         // ECDSA signature parameter s
    }

    event GaslessTokenTransferCompleted(
        address indexed senderAddress,
        address indexed recipientAddress,
        address indexed tokenContractAddress,
        uint256 transferredAmount,
        uint256 relayerCompensation,
        address executingRelayer,
        uint256 transactionNonce
    );

    event RelayerAuthorizationUpdated(address indexed relayerAddress, bool authorizationStatus);
    event TokenSupportStatusUpdated(address indexed tokenAddress, bool supportStatus);

    constructor(
        address contractOwnerAddress,
        address[] memory initialRelayerAddresses,
        address[] memory initialSupportedTokens
    ) Ownable(contractOwnerAddress) {
        // Initialize EIP-712 domain separator for signature verification
        CONTRACT_DOMAIN_SEPARATOR = keccak256(abi.encode(
            EIP712_DOMAIN_TYPEHASH,
            keccak256("SlipstreamGaslessProxy"),
            keccak256("1"),
            block.chainid,
            address(this)
        ));
        
        // Register initial authorized relayer addresses
        for (uint256 index = 0; index < initialRelayerAddresses.length; index++) {
            whitelistedRelayerAddresses[initialRelayerAddresses[index]] = true;
            emit RelayerAuthorizationUpdated(initialRelayerAddresses[index], true);
        }
        
        // Register initial supported token contracts
        for (uint256 index = 0; index < initialSupportedTokens.length; index++) {
            allowedTokenContracts[initialSupportedTokens[index]] = true;
            emit TokenSupportStatusUpdated(initialSupportedTokens[index], true);
        }
    }

    /**
     * @dev Process gasless token transfer with pre-existing allowance
     * @notice Sender must have previously approved tokens to this contract
     * @param transactionRequest The structured transfer parameters
     * @param userSignature User's cryptographic signature authorizing the transfer
     */
    function processStandardGaslessTransfer(
        GaslessTransactionRequest calldata transactionRequest,
        bytes calldata userSignature
    ) external nonReentrant whenNotPaused {
        _performTransactionValidation(transactionRequest, userSignature);
        _executeTokenTransferLogic(transactionRequest);
    }

    /**
     * @dev Process gasless token transfer using ERC2612 permit (completely gasless for user)
     * @notice User provides both transfer signature and permit signature - no prior allowances required
     * @param transactionRequest The structured transfer parameters
     * @param userSignature User's cryptographic signature authorizing the transfer
     * @param permitSignatureData ERC2612 permit signature data for token approval
     */
    function processPermitBasedGaslessTransfer(
        GaslessTransactionRequest calldata transactionRequest,
        bytes calldata userSignature,
        ERC2612PermitSignature calldata permitSignatureData
    ) external nonReentrant whenNotPaused {
        _performTransactionValidation(transactionRequest, userSignature);
        
        // Verify permit covers the total required amount (transfer + fee)
        uint256 totalRequiredAmount = transactionRequest.transferAmount + transactionRequest.relayerServiceFee;
        require(permitSignatureData.approvalValue >= totalRequiredAmount, "Insufficient permit amount");
        
        // Execute ERC2612 permit to grant allowance (gasless for user)
        IERC20Permit(transactionRequest.tokenContract).permit(
            transactionRequest.fromAddress,
            address(this),
            permitSignatureData.approvalValue,
            permitSignatureData.permitDeadline,
            permitSignatureData.signatureV,
            permitSignatureData.signatureR,
            permitSignatureData.signatureS
        );
        
        _executeTokenTransferLogic(transactionRequest);
    }

    /**
     * @dev Process multiple gasless transfers in a single transaction
     * @notice Optimized gas usage for bulk transfer operations
     */
    function processBatchStandardTransfers(
        GaslessTransactionRequest[] calldata transactionRequests,
        bytes[] calldata userSignatures
    ) external nonReentrant whenNotPaused {
        require(transactionRequests.length == userSignatures.length, "Array length mismatch");
        require(transactionRequests.length <= 10, "Too many transfers"); // Gas limit protection
        
        for (uint256 index = 0; index < transactionRequests.length; index++) {
            _performTransactionValidation(transactionRequests[index], userSignatures[index]);
            _executeTokenTransferLogic(transactionRequests[index]);
        }
    }

    /**
     * @dev Process multiple permit-based gasless transfers in batch (fully gasless)
     * @notice Maximum efficiency for multiple completely gasless transfer operations
     */
    function processBatchPermitBasedTransfers(
        GaslessTransactionRequest[] calldata transactionRequests,
        bytes[] calldata userSignatures,
        ERC2612PermitSignature[] calldata permitSignatureData
    ) external nonReentrant whenNotPaused {
        require(transactionRequests.length == userSignatures.length, "Array length mismatch");
        require(transactionRequests.length == permitSignatureData.length, "Permit data length mismatch");
        require(transactionRequests.length <= 10, "Too many transfers");
        
        for (uint256 index = 0; index < transactionRequests.length; index++) {
            _performTransactionValidation(transactionRequests[index], userSignatures[index]);
            
            // Verify permit covers the total required amount for this transfer
            uint256 totalRequiredAmount = transactionRequests[index].transferAmount + transactionRequests[index].relayerServiceFee;
            require(permitSignatureData[index].approvalValue >= totalRequiredAmount, "Insufficient permit amount");
            
            // Execute ERC2612 permit for this specific transfer
            IERC20Permit(transactionRequests[index].tokenContract).permit(
                transactionRequests[index].fromAddress,
                address(this),
                permitSignatureData[index].approvalValue,
                permitSignatureData[index].permitDeadline,
                permitSignatureData[index].signatureV,
                permitSignatureData[index].signatureR,
                permitSignatureData[index].signatureS
            );
            
            _executeTokenTransferLogic(transactionRequests[index]);
        }
    }

    /**
     * @dev Internal validation logic for gasless transaction requests
     */
    function _performTransactionValidation(
        GaslessTransactionRequest calldata transactionRequest,
        bytes calldata userSignature
    ) internal {
        // Comprehensive input validation checks
        require(whitelistedRelayerAddresses[msg.sender], "Unauthorized relayer");
        require(allowedTokenContracts[transactionRequest.tokenContract], "Token not supported");
        require(transactionRequest.toAddress != address(0), "Invalid recipient");
        require(transactionRequest.transferAmount > 0, "Invalid amount");
        require(block.timestamp <= transactionRequest.expirationDeadline, "Signature expired");
        require(userNonceCounter[transactionRequest.fromAddress] == transactionRequest.transactionNonce, "Invalid nonce");
        
        // Verify EIP-712 signature integrity BEFORE updating state
        bytes32 structuredDataHash = keccak256(abi.encode(
            GASLESS_TRANSFER_TYPEHASH,
            transactionRequest.fromAddress,
            transactionRequest.toAddress,
            transactionRequest.tokenContract,
            transactionRequest.transferAmount,
            transactionRequest.relayerServiceFee,
            transactionRequest.transactionNonce,
            transactionRequest.expirationDeadline
        ));
        
        bytes32 digestHash = keccak256(abi.encodePacked("\x19\x01", CONTRACT_DOMAIN_SEPARATOR, structuredDataHash));
        address recoveredSigner = digestHash.recover(userSignature);
        require(recoveredSigner == transactionRequest.fromAddress, "Invalid signature");
        
        // Anti-replay protection mechanism
        bytes32 uniqueTransactionId = keccak256(abi.encode(
            transactionRequest.fromAddress,
            transactionRequest.toAddress,
            transactionRequest.tokenContract,
            transactionRequest.transferAmount,
            transactionRequest.relayerServiceFee,
            transactionRequest.transactionNonce,
            transactionRequest.expirationDeadline
        ));
        require(!completedTransactionHashes[uniqueTransactionId], "Transfer already executed");
        
        // Update state variables ONLY after successful validation
        completedTransactionHashes[uniqueTransactionId] = true;
        userNonceCounter[transactionRequest.fromAddress]++;
    }

    /**
     * @dev Internal execution logic for token transfers
     */
    function _executeTokenTransferLogic(GaslessTransactionRequest calldata transactionRequest) internal {
        IERC20 tokenContractInterface = IERC20(transactionRequest.tokenContract);
        
        // Verify sender has adequate token balance and allowance
        uint256 totalAmountRequired = transactionRequest.transferAmount + transactionRequest.relayerServiceFee;
        require(tokenContractInterface.balanceOf(transactionRequest.fromAddress) >= totalAmountRequired, "Insufficient balance");
        require(tokenContractInterface.allowance(transactionRequest.fromAddress, address(this)) >= totalAmountRequired, "Insufficient allowance");
        
        // Execute token transfer to recipient address
        if (transactionRequest.transferAmount > 0) {
            tokenContractInterface.transferFrom(transactionRequest.fromAddress, transactionRequest.toAddress, transactionRequest.transferAmount);
        }
        
        // Compensate relayer for gas expenses
        if (transactionRequest.relayerServiceFee > 0) {
            tokenContractInterface.transferFrom(transactionRequest.fromAddress, msg.sender, transactionRequest.relayerServiceFee);
        }
        
        emit GaslessTokenTransferCompleted(
            transactionRequest.fromAddress,
            transactionRequest.toAddress,
            transactionRequest.tokenContract,
            transactionRequest.transferAmount,
            transactionRequest.relayerServiceFee,
            msg.sender,
            transactionRequest.transactionNonce
        );
    }

    // ======== CONTRACT ADMINISTRATION FUNCTIONS ========

    function updateRelayerAuthorizationStatus(address relayerAddress, bool authorizationStatus) external onlyOwner {
        whitelistedRelayerAddresses[relayerAddress] = authorizationStatus;
        emit RelayerAuthorizationUpdated(relayerAddress, authorizationStatus);
    }

    function updateTokenSupportStatus(address tokenAddress, bool supportStatus) external onlyOwner {
        allowedTokenContracts[tokenAddress] = supportStatus;
        emit TokenSupportStatusUpdated(tokenAddress, supportStatus);
    }

    function pauseContractOperations() external onlyOwner {
        _pause();
    }

    function resumeContractOperations() external onlyOwner {
        _unpause();
    }

    // ======== PUBLIC VIEW AND QUERY FUNCTIONS ========

    function getCurrentUserNonce(address userAddress) external view returns (uint256) {
        return userNonceCounter[userAddress];
    }

    function checkTransactionExecutionStatus(bytes32 transactionId) external view returns (bool) {
        return completedTransactionHashes[transactionId];
    }

    function calculateTransactionIdentifier(GaslessTransactionRequest calldata transactionRequest) external pure returns (bytes32) {
        return keccak256(abi.encode(
            transactionRequest.fromAddress,
            transactionRequest.toAddress,
            transactionRequest.tokenContract,
            transactionRequest.transferAmount,
            transactionRequest.relayerServiceFee,
            transactionRequest.transactionNonce,
            transactionRequest.expirationDeadline
        ));
    }

    /**
     * @dev Verify if a token contract implements EIP-2612 permit functionality
     */
    function checkERC2612PermitSupport(address tokenAddress) external view returns (bool) {
        try IERC20Permit(tokenAddress).DOMAIN_SEPARATOR() returns (bytes32) {
            return true;
        } catch {
            return false;
        }
    }

    /**
     * @dev Emergency recovery function for accidentally sent tokens
     */
    function emergencyTokenRecovery(
        address tokenAddress,
        address destinationAddress,
        uint256 recoveryAmount
    ) external onlyOwner {
        IERC20(tokenAddress).transfer(destinationAddress, recoveryAmount);
    }
}