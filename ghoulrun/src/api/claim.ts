// app/api/claim/route.ts
import { claimCheckpointBackend } from "@/server/claimCheckpoint";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { player } = await req.json();

  try {
    const txHash = await claimCheckpointBackend(player);
    return NextResponse.json({ success: true, txHash });
  } catch (err) {
    console.error("Claim failed:", err);
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}
