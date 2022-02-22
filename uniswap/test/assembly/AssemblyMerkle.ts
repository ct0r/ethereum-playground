import { expect } from "chai";
import { randomBytes } from "crypto";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";

describe("Assembly Merkle", () => {
  describe("verify", () => {
    let merkle: Contract;
    let root: Uint8Array;
    let proof: Uint8Array[];
    let signer: Signer;

    beforeEach(async () => {
      [, signer] = await ethers.getSigners();

      const signerAddr = await signer.getAddress();
      const randomAddrs = Array.from({ length: 5 }).map(
        () => "0x" + randomBytes(20).toString("hex")
      );

      const coder = new ethers.utils.AbiCoder();
      const items = [signerAddr, ...randomAddrs].map((addr) =>
        ethers.utils.arrayify(
          ethers.utils.keccak256(coder.encode(["address"], [addr]))
        )
      );

      [root, proof] = getMerkleProof(items, 0);

      merkle = await ethers
        .getContractFactory("AssemblyMerkle")
        .then((contract) => contract.deploy(root))
        .then((contract) => contract.deployed());
    });

    it("containsSender doesn't revert with valid proof", async () => {
      await merkle.connect(signer).containsSender(proof);
    });

    it("containsSender reverts with invalid proof", async () => {
      await expect(merkle.containsSender(proof)).to.be.revertedWith("");
    });
  });

  function getMerkleProof(
    items: Uint8Array[],
    index: number
  ): [Uint8Array, Uint8Array[]] {
    let proof = [];

    let layer = items;
    for (let p = index; layer.length > 1; p = Math.floor(p / 2)) {
      let nextLayer = [];

      for (let i = 0; i < layer.length; i += 2) {
        const l = layer[i];
        const r = layer[i + 1];

        let data;
        if (r) {
          data = new Uint8Array(l.length + r.length);
          data.set(l);
          data.set(r, l.length);
        } else {
          data = l;
        }

        const hash = ethers.utils.arrayify(ethers.utils.keccak256(data));

        nextLayer.push(hash);
      }

      proof.push(layer[p % 2 ? p - 1 : p + 1] ?? layer[p]);

      layer = nextLayer;
    }

    return [layer[0], proof];
  }
});
