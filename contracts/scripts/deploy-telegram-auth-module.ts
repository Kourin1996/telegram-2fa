import { ethers } from "hardhat";

// 0x4445E67ED979a7500d8535982540cEa5De5E7e5C

async function main() {
  const module = await ethers.deployContract("TelegramAuthrizationModule", []);

  await module.waitForDeployment();

  console.log("TelegramAuthrizationModule deployed: ", await module.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
