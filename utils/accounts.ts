import {
   Address,
   Base64EncodedDataResponse,
   getAddressEncoder,
   Base58EncodedBytes,
   ProgramDerivedAddressBump,
   getProgramDerivedAddress,
   Rpc,
   SolanaRpcApi,
   GetProgramAccountsDatasizeFilter,
   GetProgramAccountsMemcmpFilter,
   Base64EncodedBytes,
   createRpc,
   createSolanaRpc,
} from "@solana/kit";
import { getBetCodec, getOperationalStatusCodec, getProgramConfigCodec, OperationalStatus, ProgramConfig, type Bet } from "../codex";
import {
   TOKEN_PROGRAM_ADDR,
   TOKEN_MINT_ADDR,
   PROGRAM_ADDR,
   ASSOCIATED_TOKEN_PROGRAM_ID,
   PROGRAM_AUTH_PDA_ADDR,
} from "../constants";
import { uuidToU8Array } from "./transforms";

const addressEncoder = getAddressEncoder();
const betCodec = getBetCodec();
const programConfigCodec = getProgramConfigCodec();

export interface DecodedBetAccount extends Bet {
   pubkey: Address;
}

export class BetDecodeError extends Error {
   constructor(
      message: string,
      public cause?: unknown,
   ) {
      super(message);
      this.name = "BetDecodeError";
   }
}

/**
 * Decode a bet account from base64 encoded data
 */
export function decodeBetAccount(
   data: Base64EncodedDataResponse,
   pubkey: Address,
): DecodedBetAccount {
   try {
      const [decodedData] = data;
      const buffer = Buffer.from(decodedData, "base64");

      if (buffer.length < 120) {
         throw new BetDecodeError(
            `Invalid bet account size: ${buffer.length} bytes, expected at least 120`,
         );
      }

      const decodedBet = betCodec.decode(new Uint8Array(buffer));

      return {
         ...decodedBet,
         pubkey,
      };
   } catch (error) {
      if (error instanceof BetDecodeError) {
         throw error;
      }
      throw new BetDecodeError(`Failed to decode bet account ${pubkey}`, error);
   }
}

/**
 * Get all bet accounts for a specific user
 */
export async function getUserBetsOnchain(
   userAddr: Address,
   rpc: Rpc<SolanaRpcApi>,
   onlyUnmatched: boolean = false,
   betId?: string | false,
   network: "solana_mainnet" | "solana_devnet" = "solana_mainnet"
): Promise<DecodedBetAccount[]> {
   try {

      const filters: (GetProgramAccountsDatasizeFilter | GetProgramAccountsMemcmpFilter)[] = [
         {
            memcmp: {
               offset: 16n,
               bytes: userAddr.toString() as Base58EncodedBytes,
               encoding: "base58",
            },
         }
      ];
      if(onlyUnmatched){
         filters.push({
            dataSize: 120n,
         });
      }
      if(betId){
         filters.push({
            memcmp: {
               offset: 0n,
               bytes: Buffer.from(uuidToU8Array(betId)).toString("base64") as Base64EncodedBytes,
               encoding: "base64",
            },
         });
      }
      const response = await rpc
         .getProgramAccounts(PROGRAM_ADDR[network], {
            encoding: "base64",
            filters,
         })
         .send();

      const results: DecodedBetAccount[] = [];
      const errors: Array<{ pubkey: string; error: string }> = [];

      // Process each account, collecting errors instead of failing entirely
      for (const account of response) {
         try {
            const decoded = decodeBetAccount(
               account.account.data,
               account.pubkey,
            );
            results.push(decoded);
         } catch (error) {
            errors.push({
               pubkey: account.pubkey,
               error: error instanceof Error ? error.message : String(error),
            });
         }
      }

      // Log errors if any occurred
      if (errors.length > 0) {
         console.warn(
            `Failed to decode ${errors.length} bet accounts:`,
            errors,
         );
      }

      return results;
   } catch (error) {
      throw new Error(
         `Failed to fetch user bets: ${error instanceof Error ? error.message : String(error)}`,
      );
   }
}

/**
 * Get all bet accounts from the program
 */
export async function getAllBetAccounts(
   rpc: Rpc<SolanaRpcApi>,
   network: "solana_mainnet" | "solana_devnet" = "solana_mainnet"
): Promise<DecodedBetAccount[]> {
   try{
      const response = await rpc
         .getProgramAccounts(PROGRAM_ADDR[network], {
            encoding: "base64",
         })
         .send();

      const results: DecodedBetAccount[] = [];
      const errors: Array<{ pubkey: string; error: string }> = [];

      // Process each account
      for (const account of response) {
         try {
            const [data] = account.account.data;
            const buffer = Buffer.from(data, "base64");

            // Only process accounts that could be bet accounts
            if (buffer.length >= 120) {
               const decoded = decodeBetAccount(
                  account.account.data,
                  account.pubkey,
               );
               results.push(decoded);
            }
         } catch (error) {
            errors.push({
               pubkey: account.pubkey,
               error: error instanceof Error ? error.message : String(error),
            });
         }
      }

      // Log errors if any occurred
      if (errors.length > 0) {
         console.warn(`Failed to decode ${errors.length} accounts:`, errors);
      }

      return results;
   } catch (error) {
      throw new Error(
         `Failed to fetch all bet accounts: ${error instanceof Error ? error.message : String(error)}`,
      );
   }
}

/**
 * Get a single bet account
 */
export async function getBetAccount(
   betAddress: Address,
   rpc: Rpc<SolanaRpcApi>,
   network: "solana_mainnet" | "solana_devnet" = "solana_mainnet",
): Promise<DecodedBetAccount | null> {
   try {
      const response = await rpc
         .getAccountInfo(betAddress, {
            encoding: "base64",
         })
         .send();

      if (!response?.value) {
         return null;
      }

      try {
         return decodeBetAccount(response.value.data, betAddress);
      } catch (error) {
         // For single account fetches, we throw the decode error
         // since the caller specifically requested this account
         throw new BetDecodeError(
            `Failed to decode bet account ${betAddress}`,
            error,
         );
      }
   } catch (error) {
      if (error instanceof BetDecodeError) {
         throw error;
      }
      throw new Error(
         `Failed to fetch bet account ${betAddress}: ${error instanceof Error ? error.message : String(error)}`,
      );
   }
}

export async function getATA(
   owner: Address,
   tokenMint: Address = TOKEN_MINT_ADDR["solana_mainnet"],
   tokenProgram: Address = TOKEN_PROGRAM_ADDR["solana_mainnet"],
   assocTokenProgram: Address = ASSOCIATED_TOKEN_PROGRAM_ID["solana_mainnet"],
): Promise<readonly [Address<string>, ProgramDerivedAddressBump]> {
   const ataAddrAndBump = await getProgramDerivedAddress({
      programAddress: assocTokenProgram,
      seeds: [
         addressEncoder.encode(owner),
         addressEncoder.encode(tokenProgram),
         addressEncoder.encode(tokenMint),
      ],
   });
   return ataAddrAndBump;
}

export async function getProgramConfig(rpc: Rpc<SolanaRpcApi>, network: "solana_mainnet" | "solana_devnet" = "solana_mainnet"): Promise<ProgramConfig|null> {
   const programConfig = await rpc.getAccountInfo(PROGRAM_AUTH_PDA_ADDR[network], {encoding: "base64"}).send()
   if(programConfig === null || programConfig.value === null) return null
   const programConfigDecoded = programConfigCodec.decode(Buffer.from(programConfig.value.data[0], programConfig.value.data[1]))
   return programConfigDecoded
}

/**
 * Get the current program opperational status
 */
const operationalStatusDecoder = getOperationalStatusCodec();
export async function getProgramOperationalStatus(rpc: Rpc<SolanaRpcApi>, network: "solana_mainnet" | "solana_devnet" = "solana_mainnet"): Promise<OperationalStatus["__kind"]> {
   try{
      const response = await rpc
         .getProgramAccounts(PROGRAM_AUTH_PDA_ADDR[network], {
            encoding: "base64",
         })
         .send();
      const operationalStatus = operationalStatusDecoder.decode(Buffer.from(...response[0].account.data));
      return operationalStatus.__kind
   } catch (error) {
      throw new Error(
         `Failed to get program operational status: ${error instanceof Error ? error.message : String(error)}`,
      );
   }
}