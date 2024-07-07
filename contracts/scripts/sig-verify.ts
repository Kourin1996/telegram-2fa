import { ethers } from "hardhat";

require('dotenv').config();

const digest = '0x6db5459e7134ac3aaeb537ade10cea4cca7c81209f55c07da18dfa0091a7a1ba';
const sig = '0xbd8f4d1d1a8f4d1a949bb9c7fac359e01d74adda4fb6d2847fb8a1efcda5aea11b45a893c23fb079949dced469c6eeaf4275f9bd764093fcdeafcabca5a89e991c'

async function main() {
  const tgAuthModule = await ethers.getContractAt("TelegramAuthrizationModule", "0x90dCcE76052306B091B6F976Fd82A19d8E0E486B")

  const tx = await tgAuthModule.registerSigner(
    // SA
    '0xc9Ff389F291060ffe1BE0f369987FCeCE863095A',
    // Signer
    '0x65d4Ec89Ce26763B4BEa27692E5981D8CD3A58C7'
  );
  await tx.wait();

  // console.log('registered');

  // const res = await tgAuthModule.isValidSignatureForAddress(
  //   digest,
  //   sig,
  //   '0x566Df0a4cB8d3D042FCeDfB2e83076606fdF1A3b'
  // );
  // console.log('res', res);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
