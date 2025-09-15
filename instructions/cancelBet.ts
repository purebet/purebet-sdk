import {
   getProgramDerivedAddress,
   Instruction,
   AccountRole,
   Address,
   getAddressEncoder,
} from "@solana/kit";
import { getActionsCodec } from "../codex";
import {
   PROGRAM_ADDR,
   PROGRAM_AUTH_PDA_ADDR,
   TOKEN_MINT_ADDR,
   TOKEN_PROGRAM_ADDR,
   PROGRAM_FEE_ADDR,
   FREEBET_PROGRAM_ID,
   FB_ACCOUNT_SEED,
   FRONTEND_ADDR,
   FREEBET_AUTH_SEED,
   ADMIN_ADDR,
   ASSOCIATED_TOKEN_PROGRAM_ID,
} from "../constants";
import { getATA } from "../utils/accounts";

const actionsCodec = getActionsCodec();
const addressEncoder = getAddressEncoder();

// Function overloads for different parameter combinations
export async function buildCancelBetInstruction(
   isAdmin: boolean,
   bet: Address,
   bettor: Address,
   network: "solana_mainnet" | "solana_devnet",
   isFreebet: true,
   frontend: {id: number, address: Address},
): Promise<Instruction>;

export async function buildCancelBetInstruction(
   isAdmin: boolean,
   bet: Address,
   bettor: Address,
   network: "solana_mainnet" | "solana_devnet",
   isFreebet?: false,
   frontend?: {id: number, address: Address},
): Promise<Instruction>;

// Implementation
export async function buildCancelBetInstruction(
   isAdmin: boolean,
   bet: Address,
   bettor: Address,
   network: "solana_mainnet" | "solana_devnet" = "solana_mainnet",
   isFreebet: boolean = false,
   frontend?: {id: number, address: Address},
): Promise<Instruction> {
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
         programAddress: frontend.address,
         seeds: [
            addressEncoder.encode(FRONTEND_ADDR[network]),
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

   const data = new Uint8Array(
      actionsCodec.encode({
         __kind: "CancelBet",
         value: isAdmin,
      }),
   );

   return {
      programAddress: PROGRAM_ADDR[network],
      accounts,
      data,
   };
}
