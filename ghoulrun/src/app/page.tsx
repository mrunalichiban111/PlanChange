// components/GhostGame.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const GhostGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeSurvived, setTimeSurvived] = useState(0);
  const [stake, setStake] = useState(10);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const backgroundImage = new window.Image();
    backgroundImage.src = "/images/bg.jpg"; // relative to public folder
    if (!canvas || !context) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let ghostY = canvas.height - 150;
    let velocityY = 0;
    let gravity = 1.5;
    let isJumping = false;
    let ghostX = 100; // Position further from the left

    let obstacles: { x: number; width: number; height: number }[] = [];
    let obstacleSpawnInterval = 2000;
    let lastSpawn = Date.now();

    let startTime: number;
    let animationFrameId: number;

    const spawnObstacle = () => {
      const height = 50 + Math.random() * 50;
      const width = 20 + Math.random() * 30;
      obstacles.push({ x: canvas.width, width, height });
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
      context.fillStyle = "blue";
      context.beginPath();
      context.arc(ghostX, ghostY, 25, 0, Math.PI * 2);
      context.fill();

      // Obstacles
      context.fillStyle = "#8b0000";
      obstacles = obstacles.map((obstacle) => {
        obstacle.x -= 5;
        context.fillRect(
          obstacle.x,
          canvas.height - 100 - obstacle.height,
          obstacle.width,
          obstacle.height
        );
        return obstacle;
      }).filter(obstacle => obstacle.x + obstacle.width > 0);

      if (Date.now() - lastSpawn > obstacleSpawnInterval) {
        spawnObstacle();
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
      context.fillStyle = "purple";
      context.font = "20px Arial";
      context.fillText(`Time: ${seconds}s`, 30, 40);
      context.fillText(`Stake: ${stake + Math.floor(seconds / 10)} tokens`, 30, 70);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    const startGame = () => {
      setIsRunning(true);
      setTimeSurvived(0);
      setStake(10);
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
      {!isRunning && (
        <Button
          className="absolute z-10 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
          onClick={() => setIsRunning(true)}
        >
          Start Game
        </Button>
      )}
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
    </div>
  );
};

export default GhostGame;
