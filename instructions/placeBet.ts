import {
   Address,
   Instruction,
   AccountRole,
   getProgramDerivedAddress,
} from "@solana/kit";
import { getActionsCodec, getInstructionCodec, type BetData } from "../codex";
import { getATA } from "../utils/accounts";
import {
   PROGRAM_ADDR,
   BET_ACC_SEED,
   PROGRAM_AUTH_PDA_ADDR,
   PROGRAM_FEE_ADDR,
   TOKEN_PROGRAM_ADDR,
   TOKEN_MINT_ADDR,
   ASSOCIATED_TOKEN_PROGRAM_ID,
   SYSTEM_PROGRAM_ADDR,
} from "../constants";

const actionsCodec = getActionsCodec();
const instructionCodec = getInstructionCodec();


/**
 * Builds a PlaceBet instruction
 * @param bettor - The bettor's address
 * @param betData - The bet data (should already have bet_id as Uint8Array)
 * @param network - The Solana network to use (mainnet or devnet) - defaults to mainnet
 * @param serialise - Whether to return the instruction as serialized bytes (Uint8Array) or as an Instruction object - defaults to Instruction
 * @returns The instruction to place a bet, either as an Instruction object or serialized Uint8Array
 */
export async function buildPlaceBetInstruction(
   bettor: Address,
   betData: BetData,
   network: "solana_mainnet" | "solana_devnet",
   serialise: false,
): Promise<Instruction>
export async function buildPlaceBetInstruction(
   bettor: Address,
   betData: BetData,
   network: "solana_mainnet" | "solana_devnet",
   serialise: true,
): Promise<Uint8Array>
export async function buildPlaceBetInstruction(
   bettor: Address,
   betData: BetData,
   network: "solana_mainnet" | "solana_devnet" = "solana_mainnet",
   serialise: boolean = false,
): Promise<Instruction | Uint8Array> {
   // Derive the bet PDA
   const [betPda] = await getProgramDerivedAddress({
      programAddress: PROGRAM_ADDR[network],
      seeds: [betData.bet_id, Buffer.from(BET_ACC_SEED)],
   });

   // Get associated token accounts
   const [betAta] = await getATA(betPda, TOKEN_MINT_ADDR[network], TOKEN_PROGRAM_ADDR[network], ASSOCIATED_TOKEN_PROGRAM_ID[network]);
   const [bettorAta] = await getATA(bettor, TOKEN_MINT_ADDR[network], TOKEN_PROGRAM_ADDR[network], ASSOCIATED_TOKEN_PROGRAM_ID[network]);

   // Encode instruction data using the codec
   const data = new Uint8Array(
      actionsCodec.encode({
         __kind: "PlaceBet",
         value: betData,
      }),
   );

   const instruction: Instruction = {
      programAddress: PROGRAM_ADDR[network],
      accounts: [
         { address: bettor, role: AccountRole.WRITABLE_SIGNER },
         { address: betPda, role: AccountRole.WRITABLE },
         { address: betAta, role: AccountRole.WRITABLE },
         { address: PROGRAM_AUTH_PDA_ADDR[network], role: AccountRole.READONLY },
         { address: PROGRAM_FEE_ADDR[network], role: AccountRole.WRITABLE },
         { address: bettorAta, role: AccountRole.WRITABLE },
         { address: TOKEN_PROGRAM_ADDR[network], role: AccountRole.READONLY },
         { address: TOKEN_MINT_ADDR[network], role: AccountRole.READONLY },
         { address: SYSTEM_PROGRAM_ADDR[network], role: AccountRole.READONLY },
         { address: ASSOCIATED_TOKEN_PROGRAM_ID[network], role: AccountRole.READONLY },
      ],
      data,
   };

   return serialise ? instructionCodec.encode(instruction) as Uint8Array : instruction;
}