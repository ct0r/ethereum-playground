import { TransactionResponse } from "@ethersproject/abstract-provider";
import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";

describe("MetaTx", () => {
  const tx = (result: Promise<TransactionResponse>) =>
    result.then((response) => response.wait());

  describe("metaMint", () => {
    let metaTx: Contract;
    let owner: Signer;
    let signer1: Signer;

    beforeEach(async () => {
      [owner, signer1] = await ethers.getSigners();

      metaTx = await (await ethers.getContractFactory("MetaTx"))
        .deploy()
        .then((metaTx) => metaTx.deployed());
    });

    it("mints with a valid signature", async () => {
      const amount = 100;
      const to = await signer1.getAddress();
      const hash = ethers.utils.arrayify(
        ethers.utils.solidityKeccak256(["address", "uint256"], [to, amount])
      );

      const signature = await signer1.signMessage(hash);

      await tx(metaTx.metaMint(to, amount, signature));

      expect(await metaTx.balanceOf(to)).to.equal(amount);
    });

    it("fails with an invalid signature", async () => {
      const amount = 100;
      const to = await signer1.getAddress();
      const hash = ethers.utils.arrayify(
        ethers.utils.solidityKeccak256(["address", "uint256"], [to, amount])
      );

      const signature = await owner.signMessage(hash);

      await expect(
        tx(metaTx.metaMint(to, amount, signature))
      ).to.be.revertedWith("You shall not mint!");

      expect(await metaTx.balanceOf(to)).to.equal(0);
    });
  });
});
