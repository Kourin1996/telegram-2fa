import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@openzeppelin/hardhat-upgrades';

require('dotenv').config();

const KEYS = process.env.PRIVATE_KEYS?.split(',');

const config: HardhatUserConfig = {
  defaultNetwork: "base_sepolia",
  networks: {
    hardhat: {},
    base_sepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL,
      accounts: KEYS,
    }
  },
  solidity: {
    version: "0.8.26",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
};

export default config;
