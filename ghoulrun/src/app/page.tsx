"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import WalletConnect from "../components/WalletConnect";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { GameLogicAbi } from "../contracts/contracts";
import { claimCheckpoint } from "../contracts/functions";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { config } from "../contracts/lib/wagmi"
import { CONTRACT_ADDRESS } from "../contracts/contracts";

const CONTRACT_ADDR = CONTRACT_ADDRESS.GameLogic as `0x${string}`;


import { getAccount, signTypedData, writeContract } from 'wagmi/actions';

const GhostGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [stake, setStake] = useState(0.01); // in ETH
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeSurvived, setTimeSurvived] = useState(0);
  const { address, isConnected } = useAccount();
  const { writeContract, data: txHash } = useWriteContract();
  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  const [lastCheckpoint, setLastCheckpoint] = useState<number | null>(null); // 🆕 new state
  const spookyMusic = typeof Audio !== "undefined" ? new Audio("/sounds/spooky.mp3") : null;
    if (spookyMusic) {
        spookyMusic.loop = true;
        spookyMusic.volume = 0.5;
    }








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
    const backgroundImage = new window.Image();
    backgroundImage.src = "/images/bg.jpg"; // relative to public folder
    if (!canvas || !context) return;

    const ghostImg = new Image();
    ghostImg.src = "/images/bhoot.png";

    const obstacleImg = new Image();
    obstacleImg.src = "/images/grave.png"; // adjust to your image path

    const flyingObstacleImage = new Image();
    flyingObstacleImage.src = '/images/bat.png';



    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let ghostY = canvas.height - 150;
    let velocityY = 0;
    let gravity = 1.5;
    let isJumping = false;
    let ghostX = 100; // Position further from the left
    let flyingObstacles: { x: number; y: number; width: number; height: number }[] = [];

    let obstacles: {
      fillStyle: string; x: number; width: number; height: number
    }[] = [];
    let obstacleSpawnInterval = 2000;
    let lastSpawn = Date.now();

    let startTime: number;
    let animationFrameId: number;

    const spawnObstacle = () => {
      const height = 50 + Math.random() * 50;
      const width = 20 + Math.random() * 30;
      obstacles.push({
        x: canvas.width, width, height,
        fillStyle: ""
      });
    };

    let jumps = 0;
    const maxJumps = 2;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && jumps < maxJumps) {
        velocityY = -22 + jumps * -4; // second jump is slightly weaker
        jumps++;
      }
    };

    const gameLoop = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;

      context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

      // Ground
      context.fillStyle = "#444";
      context.fillRect(0, canvas.height - 100, canvas.width, 100);

      // Ghost
      velocityY += gravity * 0.6; // less gravity for a floatier arc
      ghostY += velocityY;

      // Collision with ground
      if (ghostY > canvas.height - 150) {
        ghostY = canvas.height - 150;
        velocityY = 0;
        jumps = 0; // reset jumps once landed
      }
      context.drawImage(ghostImg, ghostX - 32, ghostY - 32, 80, 80); // Adjust size/offset as needed

      const speed = 5 + Math.floor(elapsed / 10); // speed increases every 10 seconds

      obstacles = obstacles.map((obstacle) => {
        obstacle.x -= speed;

        if (obstacleImg.complete) {
          context.drawImage(
            obstacleImg,
            obstacle.x,
            canvas.height - 100 - obstacle.height,
            obstacle.width - 80,
            obstacle.height
          );
        } else {
          context.fillStyle = "red";
          context.fillRect(
            obstacle.x,
            canvas.height - 100 - obstacle.height,
            obstacle.width,
            obstacle.height
          );
        }

        return obstacle;
      }).filter(obstacle => obstacle.x + obstacle.width > 0);


      if (elapsed > 10 && Math.random() < 0.01) { // low chance spawn
        const width = 60;
        const height = 50;
        const y = canvas.height - 450 - Math.random() * 100;
        flyingObstacles.push({ x: canvas.width, y, width, height });
      }

      flyingObstacles = flyingObstacles.map((fo) => {
        fo.x -= speed;

        if (flyingObstacleImage.complete) {
          context.drawImage(flyingObstacleImage, fo.x, fo.y, fo.width, fo.height);
        } else {
          // fallback shape if image isn't loaded
          context.fillStyle = "#ff69b4";
          context.fillRect(fo.x, fo.y, fo.width, fo.height);
        }

        return fo;
      }).filter((fo) => fo.x + fo.width > 0);

      for (let fo of flyingObstacles) {
        if (
          ghostX + 25 > fo.x &&
          ghostX - 25 < fo.x + fo.width &&
          ghostY + 25 > fo.y &&
          ghostY - 25 < fo.y + fo.height
        ) {
          setIsRunning(false);
          cancelAnimationFrame(animationFrameId);
          return;
        }
      }



      if (Date.now() - lastSpawn > obstacleSpawnInterval) {
        spawnObstacle();

        // After 35s, 30% chance to spawn a second obstacle close behind
        if ((performance.now() - startTime) / 1000 > 35 && Math.random() < 0.3) {
          setTimeout(() => {
            spawnObstacle();
          }, 300); // slight delay between the two
        }

        // ⬇️ Gradually decrease the interval to make game harder
        const elapsedSeconds = (performance.now() - startTime) / 1000;
        obstacleSpawnInterval = Math.max(500, 2000 - elapsedSeconds * 15);

        lastSpawn = Date.now();
      }

      // Collision Detection
      for (let obs of obstacles) {
        if (
          ghostX + 25 > obs.x &&
          ghostX - 25 < obs.x + obs.width &&
          ghostY + 25 > canvas.height - 100 - obs.height
        ) {
          setIsRunning(false);
          cancelAnimationFrame(animationFrameId);
          return;
        }
      }

      // Timer and stake display
      const seconds = Math.floor(elapsed);
      context.fillStyle = "white";
      context.font = "20px Arial";
      context.fillText(`Time: ${seconds}s`, 30, 40);
      context.fillText(`Stake: ${stake + Math.floor(seconds / 10)} tokens`, 30, 70);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    const startGame = () => {
      if (spookyMusic && spookyMusic.paused) {
        spookyMusic.play().catch(err => console.warn("Audio play blocked:", err));
      }
      setIsRunning(true);
      setTimeSurvived(0);
      setStake(0.01);
      obstacles = [];
      ghostY = canvas.height - 150;
      velocityY = 0;
      isJumping = false;
      startTime = performance.now();
      lastSpawn = Date.now();
      window.addEventListener("keydown", handleKeyDown);
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    if (isRunning) {
      startGame();
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
              Start Game (Stake {stake} MON)
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
