import {getDefaultConfig} from '@rainbow-me/rainbowkit';
import {baseSepolia} from 'wagmi/chains';
import {WALLET_CONNECT_PROJECT_ID} from './config/constants';

export const config = getDefaultConfig({
    appName: 'My RainbowKit App',
    projectId: WALLET_CONNECT_PROJECT_ID,
    chains: [baseSepolia],
  });