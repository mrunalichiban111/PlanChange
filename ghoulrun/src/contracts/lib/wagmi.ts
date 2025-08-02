import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
 monadTestnet
} from 'wagmi/chains';

const config = getDefaultConfig({
  appName: 'Ghoul Runner',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [monadTestnet],
  ssr: true,
});

export { config };
