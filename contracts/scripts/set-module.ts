import { ethers } from "hardhat";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { createSmartAccountClient } from "@biconomy/account";

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
  });
  
  const saAddress = await smartWallet.getAccountAddress();
  console.log("SA Address", saAddress);

  // deoosit
  const [signer] = await ethers.getSigners();
  const tx1 = await signer.sendTransaction({
    to: saAddress,
    value: ethers.parseEther("0.002"),
  });
  console.log('tx1', tx1);

  // TODO: Sent from Phone Account
  const tgAuthModule = await ethers.getContractAt("TelegramAuthrizationModule", "0x4445E67ED979a7500d8535982540cEa5De5E7e5C")
  const tx0 = await tgAuthModule.initForSmartAccount(
    smartWallet.getAddress(),
  );
  await tx0.wait();

  // send enable
  const enableModuleTrx = await smartWallet.getEnableModuleData(
    // Enabled
    '0x4445E67ED979a7500d8535982540cEa5De5E7e5C',
    // Disabled
    // '0x6D28F3e73C67F6e9d3D3C3CEC6FB08E0e19785b0',
    // special
    // '0xDa711213bdd15dafd0DFAF8F65864fD93E4dCB61'
  );
  const res1 = await smartWallet.sendTransaction(enableModuleTrx);
  const rec1 = await res1.wait();
  console.log('module enabled');

  // send
  console.log('sending userOp');
  const userOp = await smartWallet.buildUserOp([{
    to: '0xD979df5BF656D45318D84670aF00a00e0a5e5A0c',
    value: ethers.parseEther('0.001'),
  }])
  const userOpHash = getUserOpHash(userOp);
  console.log("userOpHash", userOpHash)
  const moduleSig = await signer.signMessage(userOpHash);
  console.log('signature', moduleSig)
  const signatureWithModuleAddress = ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes", "address"],
      [moduleSig, "0x0000001c5b32F37F5beA87BDD5374eB2aC54eA8e"],
  );

  console.log('moduleSig', moduleSig);
  console.log('userOpHash', userOpHash);

  const contract = await ethers.getContractAt("TelegramAuthrizationModule", "0x6D28F3e73C67F6e9d3D3C3CEC6FB08E0e19785b0");

  // const res = await contract.isValidSignatureForAddress(
  //   userOpHash,
  //   moduleSig,
  //   signer.address,
  // );
  // console.log('debug::validate', res);

  const userOperation: any = {...userOp, signature: signatureWithModuleAddress}

  const userOpResponse = await smartWallet.sendSignedUserOp(userOperation);
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
