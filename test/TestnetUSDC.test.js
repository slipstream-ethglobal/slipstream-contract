const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TestnetUSDC", function () {
  let testUSDC;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const TestnetUSDC = await ethers.getContractFactory("TestnetUSDC");
    testUSDC = await TestnetUSDC.deploy("Test USDC", "TUSDC", 6);
    await testUSDC.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      expect(await testUSDC.name()).to.equal("Test USDC");
      expect(await testUSDC.symbol()).to.equal("TUSDC");
      expect(await testUSDC.decimals()).to.equal(6);
    });

    it("Should assign the total supply to the owner", async function () {
      const ownerBalance = await testUSDC.balanceOf(owner.address);
      expect(await testUSDC.totalSupply()).to.equal(ownerBalance);
      expect(ownerBalance).to.equal(ethers.utils.parseUnits("1000000", 6));
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const transferAmount = ethers.utils.parseUnits("100", 6);
      
      await testUSDC.transfer(addr1.address, transferAmount);
      expect(await testUSDC.balanceOf(addr1.address)).to.equal(transferAmount);
    });

    it("Should not allow transfers from blacklisted accounts", async function () {
      const transferAmount = ethers.utils.parseUnits("100", 6);
      
      // First transfer some tokens to addr1
      await testUSDC.transfer(addr1.address, transferAmount);
      
      // Blacklist addr1
      await testUSDC.blacklist(addr1.address);
      
      // Try to transfer from blacklisted account
      await expect(
        testUSDC.connect(addr1).transfer(addr2.address, transferAmount)
      ).to.be.revertedWith("TestnetUSDC: sender blacklisted");
    });
  });

  describe("Faucet", function () {
    it("Should mint tokens through faucet", async function () {
      const faucetAmount = ethers.utils.parseUnits("1000", 6);
      
      await testUSDC.faucet(addr1.address, faucetAmount);
      expect(await testUSDC.balanceOf(addr1.address)).to.equal(faucetAmount);
    });

    it("Should not allow faucet amount exceeding limit", async function () {
      const exceedingAmount = ethers.utils.parseUnits("20000", 6);
      
      await expect(
        testUSDC.faucet(addr1.address, exceedingAmount)
      ).to.be.revertedWith("Faucet limit exceeded");
    });
  });
});