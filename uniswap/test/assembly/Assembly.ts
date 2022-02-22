import { expect } from "chai";
import { randomBytes } from "crypto";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";

describe("Assembly", () => {
  describe("verify", () => {
    let signer: Signer;
    let assembly: Contract;

    beforeEach(async () => {
      [, signer] = await ethers.getSigners();

      assembly = await ethers
        .getContractFactory("Assembly")
        .then((contract) => contract.deploy())
        .then((contract) => contract.deployed());
    });

    it("hashAssembly", async () => {
      const addr = await signer.getAddress();

      await assembly.hashAddress(addr);
    });

    it("abiEncode", async () => {
      const a = randomBytes(32);
      const b = randomBytes(32);

      await assembly.abiEncode(a, b);
    });

    it("returnString", async () => {
      const str = await assembly.returnString();

      expect(str).eq("Hello");
    });
  });
});
