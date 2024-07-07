import { ethers } from "hardhat";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { BiconomySmartAccountV2, Bundler, DEFAULT_ENTRYPOINT_ADDRESS, ECDSAOwnershipValidationModule } from "@biconomy/account";

require('dotenv').config();

const KEYS = process.env.PRIVATE_KEYS?.split(',');
const BUNDLER_URL = process.env.BICONOMY_BUNDLER_URL!;

function getUserOpHash(useOpMinusSignature: any) {
  const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
      [
        "address","uint256","bytes32","bytes32","uint256","uint256","uint256","uint256","uint256","bytes32",
      ],
      [
        useOpMinusSignature.sender,
        useOpMinusSignature.nonce,
        ethers.keccak256(useOpMinusSignature.initCode),
        ethers.keccak256(useOpMinusSignature.callData),
        useOpMinusSignature.callGasLimit,
        useOpMinusSignature.verificationGasLimit,
        useOpMinusSignature.preVerificationGas,
        useOpMinusSignature.maxFeePerGas,
        useOpMinusSignature.maxPriorityFeePerGas,
        ethers.keccak256(useOpMinusSignature.paymasterAndData),
      ]
    );
    
    const enc = ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "address", "uint256"],
      // Data, EntryPoint, ChainID
      [ethers.keccak256(packedData), "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789", 84532]
    );
    
    const userOpHash = ethers.keccak256(enc);

    return userOpHash;
}

const bundler = new Bundler({
  chainId: baseSepolia.id,
  entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
  bundlerUrl: BUNDLER_URL,
});

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
  const validationModule = await ECDSAOwnershipValidationModule.create({
    signer: viemSigner,
    moduleAddress: '0xEDFC0004923550303D2356f41cbCB54689A301e6',
  });

  let biconomySmartAccount = await BiconomySmartAccountV2.create({
    chainId: baseSepolia.id,
    bundler: bundler,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
    defaultValidationModule: validationModule,
    activeValidationModule: validationModule,
  });

  const saAddress = await biconomySmartAccount.getAddress();
  console.log('saAddress', saAddress)

  // deoosit
  const [signer] = await ethers.getSigners();
  const tx1 = await signer.sendTransaction({
    to: saAddress,
    value: ethers.parseEther("0.002"),
  });
  await tx1.wait();
  console.log('tx1', tx1);

  // send
  console.log('sending userOp');
  const userOp = await biconomySmartAccount.buildUserOp([{
    to: '0xD979df5BF656D45318D84670aF00a00e0a5e5A0c',
    value: ethers.parseEther('0.001'),
  }])

  const userOpHash = getUserOpHash(userOp);
  console.log("userOpHash", userOpHash)
  
  const moduleSig = await signer.signMessage(userOpHash);

  const signatureWithModuleAddress = ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes", "address"],
      [moduleSig, "0x0000001c5b32F37F5beA87BDD5374eB2aC54eA8e"],
  );

  const userOperation: any = {...userOp, signature: signatureWithModuleAddress}

  const userOpResponse = await biconomySmartAccount.sendSignedUserOp(userOperation);
  const { transactionHash } = await userOpResponse.waitForTxHash();
  console.log("Transaction Hash", transactionHash);

  const userOpReceipt = await userOpResponse.wait();
  console.log('userOpReceipt', userOpReceipt);
  if (userOpReceipt.success == "true") {
    console.log("UserOp receipt", userOpReceipt);
    console.log("Transaction receipt", userOpReceipt.receipt);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
