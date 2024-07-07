import { ethers, upgrades } from "hardhat";

async function main() {
  const smartAccount = await ethers.deployContract("SmartAccount", []);

  await smartAccount.waitForDeployment();

  console.log('deployed', await smartAccount.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
