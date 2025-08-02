import { writeContract, readContract, waitForTransactionReceipt } from "@wagmi/core";
import { CONTRACT_ADDRESS } from "./addresses";
import {config} from "./lib/wagmi";

import { UserRegistryAbi, GameLogicAbi } from "./contracts";

const UserRegisterAddress = CONTRACT_ADDRESS.UserRegister as `0x${string}`;
const GameLogicAddress = CONTRACT_ADDRESS.GameLogic as `0x${string}`;

//===========================
// USER REGISTER**************************************
//===========================
//===========================
// WRITE
//===========================
// registerUser(string)
export const registerUser = async (username: string) =>
  writeContract(config, {
    address: UserRegisterAddress,
    abi: UserRegistryAbi,
    functionName: "registerUser",
    args: [username],
  });

// updateHighScore(address, uint256)
export const updateHighScore = async (user: `0x${string}`, score: bigint) =>
  writeContract(config, {
    address: UserRegisterAddress,
    abi: UserRegistryAbi,
    functionName: "updateHighScore",
    args: [user, score],
  });

// setAuthorizedContract(address, bool)
export const setAuthorizedContract = async (
  contractAddr: `0x${string}`,
  authorized: boolean
) =>
  writeContract(config, {
    address: UserRegisterAddress,
    abi: UserRegistryAbi,
    functionName: "setAuthorizedContract",
    args: [contractAddr, authorized],
  });

// pause()
export const pauseRegistry = async () =>
  writeContract(config, {
    address: UserRegisterAddress,
    abi: UserRegistryAbi,
    functionName: "pause",
  });

// unpause()
export const unpauseRegistry = async () =>
  writeContract(config, {
    address: UserRegisterAddress,
    abi: UserRegistryAbi,
    functionName: "unpause",
  });


//===========================
// READ
//===========================

// isRegisteredUser(address)
export const isRegisteredUser = async (user: `0x${string}`) =>
  readContract(config, {
    address: UserRegisterAddress,
    abi: UserRegistryAbi,
    functionName: "isRegisteredUser",
    args: [user],
  });

// getUserProfile(address)
export const getUserProfile = async (user: `0x${string}`) =>
  readContract(config, {
    address: UserRegisterAddress,
    abi: UserRegistryAbi,
    functionName: "getUserProfile",
    args: [user],
  });

// getAddressByUsername(string)
export const getAddressByUsername = async (username: string) =>
  readContract(config, {
    address: UserRegisterAddress,
    abi: UserRegistryAbi,
    functionName: "getAddressByUsername",
    args: [username],
  });

// isUsernameAvailable(string)
export const isUsernameAvailable = async (username: string) =>
  readContract(config, {
    address: UserRegisterAddress,
    abi: UserRegistryAbi,
    functionName: "isUsernameAvailable",
    args: [username],
  });

// getTotalUsers()
export const getTotalUsers = async () =>
  readContract(config, {
    address: UserRegisterAddress,
    abi: UserRegistryAbi,
    functionName: "getTotalUsers",
  });


//===========================
// GAME LOGIC**************************************
//===========================
//===========================
// WRITE
//===========================
// purchaseTokens (payable)
export const purchaseTokens = async (value: bigint) =>
  writeContract(config, {
    address: GameLogicAddress,
    abi: GameLogicAbi,
    functionName: "purchaseTokens",
    value,
  });

// redeemTokens(uint256)
export const redeemTokens = async (tokenAmount: bigint) =>
  writeContract(config, {
    address: GameLogicAddress,
    abi: GameLogicAbi,
    functionName: "redeemTokens",
    args: [tokenAmount],
  });

// startGame (payable)
export const startGame = async (value: bigint) =>
  writeContract(config, {
    address: GameLogicAddress,
    abi: GameLogicAbi,
    functionName: "startGame",
    value,
  });

// claimCheckpoint()
export const claimCheckpoint = async () =>
  writeContract(config, {
    address: GameLogicAddress,
    abi: GameLogicAbi,
    functionName: "claimCheckpoint",
  });

// winGame()
export const winGame = async () =>
  writeContract(config, {
    address: GameLogicAddress,
    abi: GameLogicAbi,
    functionName: "winGame",
  });

// loseGame()
export const loseGame = async () =>
  writeContract(config, {
    address: GameLogicAddress,
    abi: GameLogicAbi,
    functionName: "loseGame",
  });

// setGameParams(uint256, uint256, uint256)
export const setGameParams = async (
  interval: bigint,
  percent: bigint,
  rate: bigint
) =>
  writeContract(config, {
    address: GameLogicAddress,
    abi: GameLogicAbi,
    functionName: "setGameParams",
    args: [interval, percent, rate],
  });

// pause()
export const pauseGame = async () =>
  writeContract(config, {
    address: GameLogicAddress,
    abi: GameLogicAbi,
    functionName: "pause",
  });

// unpause()
export const unpauseGame = async () =>
  writeContract(config, {
    address: GameLogicAddress,
    abi: GameLogicAbi,
    functionName: "unpause",
  });

// emergencyWithdraw()
export const emergencyWithdraw = async () =>
  writeContract(config, {
    address: GameLogicAddress,
    abi: GameLogicAbi,
    functionName: "emergencyWithdraw",
  });


//===========================
// READ
//===========================
// calculateTokensForMonad(uint256)
export const calculateTokensForMonad = async (monadAmount: bigint) =>
  readContract(config, {
    address: GameLogicAddress,
    abi: GameLogicAbi,
    functionName: "calculateTokensForMonad",
    args: [monadAmount],
  });

// calculateMonadForTokens(uint256)
export const calculateMonadForTokens = async (tokenAmount: bigint) =>
  readContract(config, {
    address: GameLogicAddress,
    abi: GameLogicAbi,
    functionName: "calculateMonadForTokens",
    args: [tokenAmount],
  });

// getUserBalance(address)
export const getUserBalance = async (user: `0x${string}`) =>
  readContract(config, {
    address: GameLogicAddress,
    abi: GameLogicAbi,
    functionName: "getUserBalance",
    args: [user],
  });

// getContractBalance()
export const getContractBalance = async () =>
  readContract(config, {
    address: GameLogicAddress,
    abi: GameLogicAbi,
    functionName: "getContractBalance",
  });
