import { randomBytes } from "crypto";
import { utils } from "ethers";
import { ethers } from "hardhat";

describe("Merkle", () => {
  it("'verify' verifies", () => {
    console.log(
      proof(["a", "b", "c", "d", "e"].map(Buffer.from), 2).map((v) =>
        Buffer.from(v).toString()
      )
    );
  });
});

// class MerkleTree {
//   _layers: Uint8Array[][];

//   constructor(items: Uint8Array[], hash: (input: Uint8Array) => Uint8Array) {
//     const layers = [items];
//     for (let l = 0; layers[l].length > 1; l++) {
//       const layer = [];
//       for (let i = 0; i < layers[l].length; i += 2) {
//         layer.push(hash(Buffer.concat([items[i], items[i + 1] ?? items[i]])));
//       }

//       layers.push(layer);
//     }

//     this._layers = layers;
//   }

//   getProof(index: number): Uint8Array[] {
//     const proof: Uint8Array[] = [];
//     for (
//       let l = 0, i = index;
//       l < this._layers.length;
//       l++, i = Math.floor(i / 2)
//     ) {
//       const item = this._layers[l][i % 2 ? i - 1 : i + 1];
//       item && proof.push(item);
//     }

//     return proof;
//   }
// }

function proof(items: Uint8Array[], index: number): Uint8Array[] {
  let proof = [];

  const hash = (buf: Uint8Array) =>
    ethers.utils.toUtf8Bytes(ethers.utils.keccak256(buf));

  for (
    let layer = items.map(hash), nextLayer = [], p = index;
    layer.length > 1;
    layer = nextLayer, p = Math.floor(p / 2)
  ) {
    for (let i = 0; i < layer.length; i += 2) {
      const l = layer[i];
      const r = layer[i + 1];

      let input;
      if (r) {
        input = new Uint8Array(l.length + r.length);
        input.set(l);
        input.set(r, l.length);
      } else {
        input = l;
      }

      // layer.push(hash(output));
      nextLayer.push(input);
    }

    proof.push(layer[p % 2 ? p - 1 : p + 1]);
  }

  return proof;
}
