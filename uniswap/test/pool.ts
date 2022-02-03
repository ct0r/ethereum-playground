import { TransactionResponse } from "@ethersproject/abstract-provider";
import { BigNumber, Contract, Wallet } from "ethers";
import { ethers } from "hardhat";
import { expect } from "chai";

const { parseEther } = ethers.utils;

const TOKEN_INIT_AMOUNT = 1000;

const tx = (result: Promise<TransactionResponse>) =>
  result.then((response) => response.wait());

describe("Pool", () => {
  let aToken: Contract;
  let bToken: Contract;
  let pool: Contract;
  let wallet: Wallet;

  beforeEach(async () => {
    const [owner] = await ethers.getSigners();

    // Create new wallet and deposit some ethers.
    wallet = ethers.Wallet.createRandom().connect(ethers.provider);

    await tx(
      owner.sendTransaction({
        to: wallet.address,
        value: parseEther("1"),
      })
    );

    // Deploy ERC20 contracts.
    const erc20Factory = await ethers.getContractFactory("TestERC20");

    [aToken, bToken] = await Promise.all(
      ["A", "B"].map((code) =>
        erc20Factory.deploy(code, code).then((token) => token.deployed())
      )
    );

    // Deploy Pool contract.
    pool = await ethers
      .getContractFactory("Pool")
      .then((factory) => factory.deploy(aToken.address, bToken.address))
      .then((contract) => contract.deployed());

    // Mint tokens to wallet.
    await Promise.all(
      [aToken, bToken].map((token) =>
        tx(token.mint(wallet.address, TOKEN_INIT_AMOUNT))
      )
    );

    // Connect contracts to wallet.
    pool = pool.connect(wallet);
    aToken = aToken.connect(wallet);
    bToken = bToken.connect(wallet);
  });

  it("'constructor' should set default state", async () => {
    expect(await pool.aBalance()).to.equal(0);
    expect(await pool.bBalance()).to.equal(0);
    expect(await pool.aToken()).to.equal(aToken.address);
    expect(await pool.bToken()).to.equal(bToken.address);
  });

  it("'deposit' should transfer tokens to contract", async () => {
    const aAmount = 10;
    const bAmount = 20;

    await tx(aToken.approve(pool.address, aAmount));
    await tx(bToken.approve(pool.address, bAmount));
    await tx(pool.deposit(aAmount, bAmount));

    expect(await aToken.balanceOf(pool.address)).to.equal(aAmount);
    expect(await aToken.balanceOf(wallet.address)).to.equal(
      TOKEN_INIT_AMOUNT - aAmount
    );
    expect(await bToken.balanceOf(pool.address)).to.equal(bAmount);
    expect(await bToken.balanceOf(wallet.address)).to.equal(
      TOKEN_INIT_AMOUNT - bAmount
    );
  });

  it("'withdraw' should transfer tokens back to sender", async () => {
    const aAmount = 10;
    const bAmount = 20;

    await tx(aToken.approve(pool.address, aAmount));
    await tx(bToken.approve(pool.address, bAmount));
    await tx(pool.deposit(aAmount, bAmount));
    await tx(pool.withdraw(aAmount, bAmount));

    expect(await aToken.balanceOf(pool.address)).to.equal(0);
    expect(await aToken.balanceOf(wallet.address)).to.equal(TOKEN_INIT_AMOUNT);
    expect(await bToken.balanceOf(pool.address)).to.equal(0);
    expect(await bToken.balanceOf(wallet.address)).to.equal(TOKEN_INIT_AMOUNT);
  });

  it("'aBalance' should return balance of A token", async () => {
    const aAmount = 10;
    const bAmount = 20;

    await tx(aToken.approve(pool.address, aAmount));
    await tx(bToken.approve(pool.address, bAmount));
    await tx(pool.deposit(aAmount, bAmount));

    expect(await pool.aBalance()).to.equal(aAmount);
  });

  it("'bBalance' should return balance of B token", async () => {
    const aAmount = 10;
    const bAmount = 20;

    await tx(aToken.approve(pool.address, aAmount));
    await tx(bToken.approve(pool.address, bAmount));
    await tx(pool.deposit(aAmount, bAmount));

    expect(await pool.bBalance()).to.equal(bAmount);
  });

  it("'price' should return valid price", async () => {
    const aAmount = 10;
    const bAmount = 20;

    await tx(aToken.approve(pool.address, aAmount));
    await tx(bToken.approve(pool.address, bAmount));
    await tx(pool.deposit(aAmount, bAmount));

    expect(await pool.price()).to.equal(BigNumber.from(aAmount).div(bAmount));
  });
});
