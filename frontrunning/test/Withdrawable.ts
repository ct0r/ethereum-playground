import {
  Provider,
  TransactionResponse,
} from "@ethersproject/abstract-provider";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { parseEther } from "ethers/lib/utils";

interface Withdrawable extends Contract {
  connect(signerOrProvider: Signer | Provider | string): Withdrawable;

  withdraw(): Promise<TransactionResponse>;
}

describe("Withdrawable", () => {
  it("'withdraw' should transfer contract ethers to the sender", async () => {
    const value = parseEther("1000");
    const withdrawable = (await ethers
      .getContractFactory("Withdrawable")
      .then((factory) => factory.deploy({ value }))
      .then((contract) => contract.deployed())) as Withdrawable;

    const [owner] = await ethers.getSigners();
    const balance = await owner.getBalance();
    const { gasUsed, effectiveGasPrice } = await withdrawable
      .withdraw()
      .then((response) => response.wait());

    expect(await owner.getBalance()).to.equal(
      balance.sub(gasUsed.mul(effectiveGasPrice)).add(value)
    );
  });
});
