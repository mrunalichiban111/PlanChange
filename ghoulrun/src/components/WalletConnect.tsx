// components/WalletConnect.tsx
"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { Button } from "@/components/ui/button";

export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div className="absolute top-4 right-4 z-50">
      {isConnected ? (
        <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-xl text-white">
          <span className="text-xs">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <Button variant="destructive" onClick={() => disconnect()}>
            Disconnect
          </Button>
        </div>
      ) : (
        <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => connect({connector: injected()})}>
          Connect Wallet
        </Button>
      )}
    </div>
  );
}
