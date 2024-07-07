import { ethers } from "hardhat";

// ERC20 1: 0xdBB6cF7B65dB3383c3F686990b2cAB4B82A28f3F

async function main() {
  const erc20 = await ethers.deployContract("MyERC20", [
    "TestToken",
    "TT",
    "0x65d4Ec89Ce26763B4BEa27692E5981D8CD3A58C7",
    ethers.parseEther("10000000000"),
  ]);

  await erc20.waitForDeployment();

  console.log("ERC20 deployed: ", await erc20.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
