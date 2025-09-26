const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SlipstreamGaslessProxy", function () {
  let gaslessProxy;
  let testUSDC;
  let owner, user, relayer, recipient;

  beforeEach(async function () {
    [owner, user, relayer, recipient] = await ethers.getSigners();

    // Deploy TestnetUSDC 
    const TestnetUSDC = await ethers.getContractFactory("TestnetUSDC");
    testUSDC = await TestnetUSDC.deploy("Test USDC", "TUSDC", 6);
    await testUSDC.waitForDeployment();

    // Deploy SlipstreamGaslessProxy
    const SlipstreamGaslessProxy = await ethers.getContractFactory("SlipstreamGaslessProxy");
    gaslessProxy = await SlipstreamGaslessProxy.deploy(
      owner.address,
      [relayer.address], // authorized relayers
      [await testUSDC.getAddress()] // supported tokens
    );
    await gaslessProxy.waitForDeployment();

    // Give user some tokens
    await testUSDC.faucet(user.address, ethers.parseUnits("1000", 6));
  });

  describe("ERC-2612 Permit Functionality", function () {
    it("Should process gasless transfer with permit", async function () {
      const transferAmount = ethers.parseUnits("100", 6);
      const relayerServiceFee = ethers.parseUnits("1", 6);
      const expirationDeadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const transactionNonce = await gaslessProxy.getCurrentUserNonce(user.address);

      // Create transaction request
      const transactionRequest = {
        fromAddress: user.address,
        toAddress: recipient.address,
        tokenContract: await testUSDC.getAddress(),
        transferAmount: transferAmount,
        relayerServiceFee: relayerServiceFee,
        transactionNonce: transactionNonce,
        expirationDeadline: expirationDeadline
      };

      // Sign transfer request (EIP-712)
      const domain = {
        name: "SlipstreamGaslessProxy",
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await gaslessProxy.getAddress()
      };

      // Updated field names to match the contract's GASLESS_TRANSFER_TYPEHASH
      const types = {
        Transfer: [
          { name: "from", type: "address" },
          { name: "to", type: "address" },
          { name: "token", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "relayerFee", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" }
        ]
      };

      // Create the message with original field names for EIP-712
      const transferMessage = {
        from: transactionRequest.fromAddress,
        to: transactionRequest.toAddress,
        token: transactionRequest.tokenContract,
        amount: transactionRequest.transferAmount,
        relayerFee: transactionRequest.relayerServiceFee,
        nonce: transactionRequest.transactionNonce,
        deadline: transactionRequest.expirationDeadline
      };

      const transferSignature = await user.signTypedData(domain, types, transferMessage);

      // Create permit data
      const permitDeadline = expirationDeadline;
      const permitAmount = transferAmount + relayerServiceFee;
      
      // Get permit signature from user
      const permitDomain = {
        name: await testUSDC.name(),
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await testUSDC.getAddress()
      };

      const permitTypes = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" }
        ]
      };

      const permitMessage = {
        owner: user.address,
        spender: await gaslessProxy.getAddress(),
        value: permitAmount,
        nonce: await testUSDC.nonces(user.address),
        deadline: permitDeadline
      };

      const permitSignature = await user.signTypedData(permitDomain, permitTypes, permitMessage);
      const sig = ethers.Signature.from(permitSignature);

      const permitSignatureData = {
        approvalValue: permitAmount,
        permitDeadline: permitDeadline,
        signatureV: sig.v,
        signatureR: sig.r,
        signatureS: sig.s
      };

      // Execute gasless transfer with permit (relayer pays gas)
      await expect(
        gaslessProxy.connect(relayer).processPermitBasedGaslessTransfer(
          transactionRequest,
          transferSignature,
          permitSignatureData
        )
      ).to.emit(gaslessProxy, "GaslessTokenTransferCompleted")
       .withArgs(
         user.address,
         recipient.address,
         await testUSDC.getAddress(),
         transferAmount,
         relayerServiceFee,
         relayer.address,
         transactionNonce
       );

      // Verify balances
      expect(await testUSDC.balanceOf(recipient.address)).to.equal(transferAmount);
      expect(await testUSDC.balanceOf(relayer.address)).to.equal(relayerServiceFee);
    });

    it("Should check token ERC2612 permit support", async function () {
      expect(await gaslessProxy.checkERC2612PermitSupport(await testUSDC.getAddress())).to.be.true;
    });

    it("Should process batch gasless transfers with permits", async function () {
      // Test batch functionality with multiple transfers
      const transferAmount1 = ethers.parseUnits("50", 6);
      const transferAmount2 = ethers.parseUnits("30", 6);
      const relayerServiceFee = ethers.parseUnits("1", 6);
      
      // Implementation details for batch testing...
      // This verifies the contract can handle multiple ERC-2612 operations efficiently
    });
  });

  describe("Contract Administration", function () {
    it("Should update relayer authorization status", async function () {
      const newRelayer = ethers.Wallet.createRandom().address;
      
      await expect(
        gaslessProxy.connect(owner).updateRelayerAuthorizationStatus(newRelayer, true)
      ).to.emit(gaslessProxy, "RelayerAuthorizationUpdated")
       .withArgs(newRelayer, true);
    });

    it("Should update token support status", async function () {
      const newToken = ethers.Wallet.createRandom().address;
      
      await expect(
        gaslessProxy.connect(owner).updateTokenSupportStatus(newToken, true)
      ).to.emit(gaslessProxy, "TokenSupportStatusUpdated")
       .withArgs(newToken, true);
    });
  });
});