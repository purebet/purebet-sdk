import {
   getProgramDerivedAddress,
   Instruction,
   AccountRole,
   Address,
   getAddressEncoder,
} from "@solana/kit";
import { getActionsCodec, getInstructionCodec } from "../codex";
import {
   PROGRAM_ADDR,
   PROGRAM_AUTH_PDA_ADDR,
   TOKEN_MINT_ADDR,
   TOKEN_PROGRAM_ADDR,
   PROGRAM_FEE_ADDR,
   FREEBET_PROGRAM_ID,
   FB_ACCOUNT_SEED,
   PB_FRONTEND_ADDR,
   FREEBET_AUTH_SEED,
   ADMIN_ADDR,
   ASSOCIATED_TOKEN_PROGRAM_ID,
   SOL_FREE_ADDR,
} from "../constants";
import { getATA } from "../utils/accounts";

const actionsCodec = getActionsCodec();
const addressEncoder = getAddressEncoder();
const instructionCodec = getInstructionCodec();

/**
 * Builds a CancelBet instruction
 * @param isAdmin - Whether the cancellation is being performed by an admin
 * @param bet - The bet account address to cancel
 * @param bettor - The bettor's address
 * @param betWasSolFree - Whether the bet was made as a SOL-free bet
 * @param txIsSolFree - Whether the transaction is being performed as a SOL-free transaction
 * @param network - The Solana network to use (mainnet or devnet) - defaults to mainnet
 * @param serialise - Whether to return the instruction as serialized bytes (Uint8Array) or as an Instruction object - defaults to Instruction
 * @param isFreebet - Whether this is a freebet cancellation - defaults to false
 * @param frontend - Frontend configuration (required when isFreebet is true) - defaults to Purebet frontend
 * @returns The instruction to cancel a bet, either as an Instruction object or serialized Uint8Array
 */

// Function overloads for different parameter combinations
export async function buildCancelBetInstruction(
   isAdmin: boolean,
   bet: Address,
   bettor: Address,
   betWasSolFree: boolean,
   txIsSolFree: boolean,
   network: "solana_mainnet" | "solana_devnet",
   serialise: false,
   isFreebet: true,
   frontend: {id: number, address: Address},
): Promise<Instruction>;

export async function buildCancelBetInstruction(
   isAdmin: boolean,
   bet: Address,
   bettor: Address,
   betWasSolFree: boolean,
   txIsSolFree: boolean,
   network: "solana_mainnet" | "solana_devnet",
   serialise: false,
   isFreebet?: false,
   frontend?: {id: number, address: Address},
): Promise<Instruction>;

export async function buildCancelBetInstruction(
   isAdmin: boolean,
   bet: Address,
   bettor: Address,
   betWasSolFree: boolean,
   txIsSolFree: boolean,
   network: "solana_mainnet" | "solana_devnet",
   serialise: true,
   isFreebet: true,
   frontend: {id: number, address: Address},
): Promise<Uint8Array>;

export async function buildCancelBetInstruction(
   isAdmin: boolean,
   bet: Address,
   bettor: Address,
   betWasSolFree: boolean,
   txIsSolFree: boolean,
   network: "solana_mainnet" | "solana_devnet",
   serialise: true,
   isFreebet?: false,
   frontend?: {id: number, address: Address},
): Promise<Uint8Array>;

// Implementation
export async function buildCancelBetInstruction(
   isAdmin: boolean,
   bet: Address,
   bettor: Address,
   betWasSolFree: boolean = false,
   txIsSolFree: boolean = false,
   network: "solana_mainnet" | "solana_devnet" = "solana_mainnet",
   serialise: boolean = false,
   isFreebet: boolean = false,
   frontend: {id: number, address: Address} = {id: 1, address: PB_FRONTEND_ADDR[network]},
): Promise<Instruction | Uint8Array> {
   const [betAta] = await getATA(bet, TOKEN_MINT_ADDR[network], TOKEN_PROGRAM_ADDR[network], ASSOCIATED_TOKEN_PROGRAM_ID[network]);

   const accounts = [
      {
         address: bettor,
         role: isAdmin ? AccountRole.WRITABLE : AccountRole.WRITABLE_SIGNER,
      },
      { address: bet, role: AccountRole.WRITABLE },
      { address: betAta, role: AccountRole.WRITABLE },
      { address: PROGRAM_AUTH_PDA_ADDR[network], role: AccountRole.READONLY },
      { address: TOKEN_MINT_ADDR[network], role: AccountRole.READONLY },
      { address: TOKEN_PROGRAM_ADDR[network], role: AccountRole.READONLY },
   ];

   if (isAdmin) {
      accounts.unshift({
         address: ADMIN_ADDR[network],
         role: AccountRole.WRITABLE_SIGNER,
      });
   }

   if (!isFreebet) {
      const [bettorAta] = await getATA(bettor, TOKEN_MINT_ADDR[network], TOKEN_PROGRAM_ADDR[network], ASSOCIATED_TOKEN_PROGRAM_ID[network]);
      accounts.push(
         { address: PROGRAM_FEE_ADDR[network], role: AccountRole.WRITABLE },
         { address: bettorAta, role: AccountRole.WRITABLE },
      );
   } else {
      if (!frontend) {
         throw new Error("Frontend configuration is required when isFreebet is true");
      }

      const [bettorFbPda] = await getProgramDerivedAddress({
         programAddress: FREEBET_PROGRAM_ID[network],
         seeds: [addressEncoder.encode(bettor), Buffer.from(FB_ACCOUNT_SEED)],
      });

      const [frontendPda] = await getProgramDerivedAddress({
         programAddress: FREEBET_PROGRAM_ID[network],
         seeds: [
            addressEncoder.encode(frontend.address),
            Buffer.from(FREEBET_AUTH_SEED),
            Buffer.from([frontend.id]),
         ],
      });

      const [frontendAta] = await getATA(frontendPda, TOKEN_MINT_ADDR[network], TOKEN_PROGRAM_ADDR[network], ASSOCIATED_TOKEN_PROGRAM_ID[network]);

      accounts.push(
         { address: bettorFbPda, role: AccountRole.WRITABLE },
         { address: FREEBET_PROGRAM_ID[network], role: AccountRole.READONLY },
         { address: frontendPda, role: AccountRole.READONLY },
         { address: frontendAta, role: AccountRole.WRITABLE },
      );
   }

   if (betWasSolFree || txIsSolFree) {
      accounts.push({ address: SOL_FREE_ADDR[network], role: txIsSolFree ? AccountRole.WRITABLE_SIGNER : AccountRole.WRITABLE });
   }

   const data = new Uint8Array(
      actionsCodec.encode({
         __kind: "CancelBet",
         value: isAdmin,
      }),
   );

   const instruction: Instruction = {
      programAddress: PROGRAM_ADDR[network],
      accounts,
      data,
   };
   return serialise ? instructionCodec.encode(instruction) as Uint8Array : instruction;
}
