import {
   Address,
   Instruction,
   AccountRole,
   getProgramDerivedAddress,
   getAddressEncoder,
} from "@solana/kit";
import { getActionsCodec, type BetData } from "../codex";
import { getATA } from "../utils/accounts";
import {
   PROGRAM_ADDR,
   BET_ACC_SEED,
   PROGRAM_AUTH_PDA_ADDR,
   TOKEN_PROGRAM_ADDR,
   TOKEN_MINT_ADDR,
   ASSOCIATED_TOKEN_PROGRAM_ID,
   SYSTEM_PROGRAM_ADDR,
   FREEBET_PROGRAM_ID,
   FB_ACCOUNT_SEED,
   FRONTEND_ADDR,
   FREEBET_AUTH_SEED,
} from "../constants";

const actionsCodec = getActionsCodec();
const addressEncoder = getAddressEncoder();

/**
 * Builds a PlaceFreeBet instruction
 * @param bettor - The bettor's address
 * @param betData - The bet data (should already have bet_id as Uint8Array)
 * @returns The instruction to place a free bet
 */
export async function buildPlaceFreebetInstruction(
   bettor: Address,
   betData: BetData,
   network: "solana_mainnet" | "solana_devnet" = "solana_mainnet",
   frontend: {id: number, address: Address} = {id: 1, address: FRONTEND_ADDR[network]},
): Promise<Instruction> {
   if(betData.freebet_id == 0){
      throw new Error("Freebet ID is required");
   }
   if(betData.frontend_id == frontend.id){
      throw new Error("Frontend in bet data is not the same as the frontend id");
   }
   // Derive the bet PDA
   const [betPda] = await getProgramDerivedAddress({
      programAddress: PROGRAM_ADDR[network],
      seeds: [betData.bet_id, Buffer.from(BET_ACC_SEED)],
   });

   // Get associated token accounts
   const [betAta] = await getATA(betPda, TOKEN_MINT_ADDR[network], TOKEN_PROGRAM_ADDR[network], ASSOCIATED_TOKEN_PROGRAM_ID[network]);

   // Derive freebet-specific PDAs
   const [userFreebetPda] = await getProgramDerivedAddress({
      programAddress: FREEBET_PROGRAM_ID[network],
      seeds: [addressEncoder.encode(bettor), Buffer.from(FB_ACCOUNT_SEED)],
   });

   const [frontendPda] = await getProgramDerivedAddress({
      programAddress: frontend.address, 
      seeds: [
         addressEncoder.encode(frontend.address),
         Buffer.from(FREEBET_AUTH_SEED),
         Buffer.from([betData.frontend_id]),
      ],
   });

   const [frontendAta] = await getATA(frontendPda, TOKEN_MINT_ADDR[network], TOKEN_PROGRAM_ADDR[network], ASSOCIATED_TOKEN_PROGRAM_ID[network]);

   // Encode instruction data using the codec
   const data = new Uint8Array(
      actionsCodec.encode({
         __kind: "PlaceFreeBet",
         value: betData,
      }),
   );

   // Build and return the instruction
   return {
      programAddress: PROGRAM_ADDR[network],
      accounts: [
         { address: bettor, role: AccountRole.WRITABLE_SIGNER },
         { address: betPda, role: AccountRole.WRITABLE },
         { address: betAta, role: AccountRole.WRITABLE },
         { address: PROGRAM_AUTH_PDA_ADDR[network], role: AccountRole.READONLY },
         { address: userFreebetPda, role: AccountRole.WRITABLE },
         { address: FREEBET_PROGRAM_ID[network], role: AccountRole.READONLY },
         { address: FRONTEND_ADDR[network], role: AccountRole.READONLY },
         { address: frontendPda, role: AccountRole.WRITABLE },
         { address: frontendAta, role: AccountRole.WRITABLE },
         { address: TOKEN_PROGRAM_ADDR[network], role: AccountRole.READONLY },
         { address: TOKEN_MINT_ADDR[network], role: AccountRole.READONLY },
         { address: SYSTEM_PROGRAM_ADDR[network], role: AccountRole.READONLY },
         { address: ASSOCIATED_TOKEN_PROGRAM_ID[network], role: AccountRole.READONLY },
      ],
      data,
   };
}
