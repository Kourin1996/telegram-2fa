import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { createSmartAccountClient } from "@biconomy/account";

require('dotenv').config();

const KEYS = process.env.PRIVATE_KEYS?.split(',');
const BUNDLER_URL = process.env.BICONOMY_BUNDLER_URL!;

async function main() {
  const config = {
    privateKey: KEYS![0],
    bundlerUrl: BUNDLER_URL,
  };
  
  // Generate EOA from private key using ethers.js
  const eoa = privateKeyToAccount(`0x${config.privateKey}`);
  const viemSigner = createWalletClient({
    account: eoa,
    chain: baseSepolia,
    transport: http(),
  });
  
  // Create Biconomy Smart Account instance
  const smartWallet = await createSmartAccountClient({
    signer: viemSigner,
    bundlerUrl: config.bundlerUrl,
    defaultFallbackHandler: '0x32A7E3212A8aB46c3D7029d2633A71e74E1BD04F'
  });
  
  const saAddress = await smartWallet.getAccountAddress();
  console.log("SmartAccount Address", saAddress);

  console.log('module enabled');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
