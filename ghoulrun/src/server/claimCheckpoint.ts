import { createWalletClient, http, parseAbiItem } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "viem/chains";
import  GameLogicAbi  from "../contracts/abi/GameLogicAbi.json"; // adjust path
import * as dotenv from "dotenv";
import { CONTRACT_ADDRESS } from "@/contracts/addresses";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const RPC_URL = process.env.RPC_URL!;
const CONTRACT_ADD = CONTRACT_ADDRESS.GameLogic as `0x${string}`;

export async function claimCheckpointBackend(playerAddress: `0x${string}`) {
  try {
    const account = privateKeyToAccount(PRIVATE_KEY);

    const client = createWalletClient({
      account,
      chain: monadTestnet,
      transport: http(RPC_URL),
    });

    const txHash = await client.writeContract({
      abi: GameLogicAbi,
      address: CONTRACT_ADD,
      functionName: "claimCheckpoint",
      account,
      args: [], // If your function has arguments, put them here
    });

    return txHash;
  } catch (err) {
    console.error("Claim failed:", err);
    throw err;
  }
}
