import { TransactionResponse } from "@ethersproject/abstract-provider";
import { Contract, Signer, Transaction } from "ethers";
import { ethers, network } from "hardhat";
import { expect } from "chai";

const { parseEther } = ethers.utils;

// Our smart contract assumes th
const SecondsPerDay = 60 * 60 * 24;

const tx = (result: Promise<TransactionResponse>) =>
  result.then((response) => response.wait());

describe("CleverToken", () => {
  let cleverToken: Contract;
  let owner: Signer;
  let ownerAddr: string;
  let alice: Signer;
  let aliceAddr: string;
  let bob: Signer;
  let bobAddr: string;

  beforeEach(async () => {
    [owner, alice, bob] = await ethers.getSigners();

    [ownerAddr, aliceAddr, bobAddr] = await Promise.all(
      [owner, alice, bob].map((signer) => signer.getAddress())
    );

    cleverToken = await ethers
      .getContractFactory("CleverToken")
      .then((factory) => factory.deploy(aliceAddr, bobAddr))
      .then((cleverToken) => cleverToken.deployed());
  });

  it("'constructor' should set default state", async () => {
    expect(await cleverToken.symbol()).to.be.equal("CT");
    expect(await cleverToken.name()).to.be.equal("CleverToken");
    expect(await cleverToken.decimals()).to.be.equal(18);
    expect(await cleverToken.balanceOf(aliceAddr)).to.equal(10);
    expect(await cleverToken.balanceOf(bobAddr)).to.equal(5);
    expect(await cleverToken.balanceOf(cleverToken.address)).to.equal(30);
  });

  it("'unlock' should transfer tokens if time requirements are met", async () => {
    const unlock = async () => {
      await tx(cleverToken.connect(alice).unlock());
      await tx(cleverToken.connect(bob).unlock());

      return [
        await cleverToken.balanceOf(aliceAddr),
        await cleverToken.balanceOf(bobAddr),
      ];
    };

    let [aliceBalance, bobBalance] = await unlock();
    expect(bobBalance).eq(5);
    expect(aliceBalance).eq(10);

    await network.provider.send("evm_increaseTime", [SecondsPerDay * 60]);

    [aliceBalance, bobBalance] = await unlock();
    expect(bobBalance).eq(10);
    expect(aliceBalance).eq(10);

    await network.provider.send("evm_increaseTime", [SecondsPerDay * 305]);

    [aliceBalance, bobBalance] = await unlock();
    expect(bobBalance).eq(10);
    expect(aliceBalance).eq(20);
  });
});
