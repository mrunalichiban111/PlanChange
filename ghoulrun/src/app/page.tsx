"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import WalletConnect from "../components/WalletConnect";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import {GameLogicAbi } from "../contracts/contracts";
import { claimCheckpoint } from "../contracts/functions";
import {  readContract, waitForTransactionReceipt } from "@wagmi/core";
import {config} from "../contracts/lib/wagmi"
import { CONTRACT_ADDRESS } from "../contracts/contracts";

const CONTRACT_ADDR = CONTRACT_ADDRESS.GameLogic as `0x${string}`;


import { getAccount, signTypedData, writeContract } from 'wagmi/actions';

const GhostGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [stake, setStake] = useState(0.01); // in ETH
  const [startTime, setStartTime] = useState<number | null>(null);

  const { address, isConnected } = useAccount();
  const { writeContract, data: txHash } = useWriteContract();
  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

    const [lastCheckpoint, setLastCheckpoint] = useState<number | null>(null); // 🆕 new state

    
    
    
    
    
    
  
  const handleStartGame = () => {
    writeContract({
      abi: GameLogicAbi,
      address: CONTRACT_ADDR,
      functionName: "startGame",
      value: parseEther(stake.toString()),
    });
    setIsRunning(true);
    setStartTime(performance.now());
  };

  const handleWin = () => {
    writeContract({
      abi: GameLogicAbi,
      address: CONTRACT_ADDR,
      functionName: "winGame",
    });
  };

  const handleLose = () => {
    writeContract({
      abi: GameLogicAbi,
      address: CONTRACT_ADDR,
      functionName: "loseGame",
    });
  };

  // Game loop logic here (same as your earlier canvas game)
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const bgImg = new Image();
    bgImg.src = "/images/bg.jpg";
    const ghostImg = new Image();
    ghostImg.src = "/images/bhoot.png";

    if (!canvas || !context) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let ghostY = canvas.height - 150;
    let velocityY = 0;
    const gravity = 1.5;
    const ghostX = 100;
    let jumps = 0;
    const maxJumps = 2;
    let animationFrameId: number;
    let obstacles: any[] = [];
    let flyingObstacles: any[] = [];
    let lastSpawn = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && jumps < maxJumps) {
        velocityY = -22 + jumps * -4;
        jumps++;
      }
    };

    const gameLoop = (timestamp: number) => {
      if (!startTime) return;
      const elapsed = (timestamp - startTime) / 1000;

      context.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      context.fillStyle = "#444";
      context.fillRect(0, canvas.height - 100, canvas.width, 100);

      velocityY += gravity * 0.6;
      ghostY += velocityY;

      if (ghostY > canvas.height - 150) {
        ghostY = canvas.height - 150;
        velocityY = 0;
        jumps = 0;
      }

      context.drawImage(ghostImg, ghostX - 32, ghostY - 32, 80, 80);

      const speed = 5 + Math.floor(elapsed / 10);

      obstacles = obstacles
        .map((o) => {
          o.x -= speed;
          context.fillStyle = "red";
          context.fillRect(o.x, canvas.height - 100 - o.height, o.width, o.height);
          return o;
        })
        .filter((o) => o.x + o.width > 0);

      flyingObstacles = flyingObstacles
        .map((fo) => {
          fo.x -= speed;
          context.fillStyle = "#ff69b4";
          context.fillRect(fo.x, fo.y, fo.width, fo.height);
          return fo;
        })
        .filter((fo) => fo.x + fo.width > 0);

      for (let o of obstacles) {
        if (
          ghostX + 25 > o.x &&
          ghostX - 25 < o.x + o.width &&
          ghostY + 25 > canvas.height - 100 - o.height
        ) {
          setIsRunning(false);
          handleLose();
          cancelAnimationFrame(animationFrameId);
          return;
        }
      }

      for (let fo of flyingObstacles) {
        if (
          ghostX + 25 > fo.x &&
          ghostX - 25 < fo.x + fo.width &&
          ghostY + 25 > fo.y &&
          ghostY - 25 < fo.y + fo.height
        ) {
          setIsRunning(false);
          handleLose();
          cancelAnimationFrame(animationFrameId);
          return;
        }
      }

      if (lastCheckpoint === null || elapsed - lastCheckpoint >= 10) {
        claimCheckpoint();
        setLastCheckpoint(elapsed);
        }

      if (Date.now() - lastSpawn > 2000) {
        const height = 50 + Math.random() * 50;
        const width = 20 + Math.random() * 30;
        obstacles.push({ x: canvas.width, width, height });
        lastSpawn = Date.now();
      }

      context.fillStyle = "white";
      context.font = "20px Arial";
      context.fillText(`Time: ${Math.floor(elapsed)}s`, 30, 40);
      context.fillText(`Stake: ${stake} ETH`, 30, 70);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    if (isRunning) {
      window.addEventListener("keydown", handleKeyDown);
      animationFrameId = requestAnimationFrame(gameLoop);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isRunning]);


  return (
    <div className="w-full h-screen relative">
      <WalletConnect />

      {!isRunning && (
        <div
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center flex flex-col items-center justify-center z-10"
          style={{ backgroundImage: "url('/images/start.jpg')" }}
        >
          <h1 className="text-5xl md:text-7xl text-white font-bold drop-shadow-lg mb-8 text-center spooky-font">
            Welcome to <br /> Spooky Stake
          </h1>

          {isConnected ? (
            <Button
              className="px-8 py-4 text-lg bg-purple-700 hover:bg-purple-800 text-white shadow-xl rounded-xl"
              onClick={handleStartGame}
            >
              Start Game (Stake {stake} ETH)
            </Button>
          ) : (
            <p className="text-white text-lg">Connect your wallet to play</p>
          )}
        </div>
      )}

      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />
    </div>
  );
};

export default GhostGame;
