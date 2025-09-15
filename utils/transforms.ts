/**
 * Transform string player to Uint8Array (32 bytes)
 */
const textEncoder = new TextEncoder();
export function playerToBytes(player: string): Uint8Array {
   if(player.length > 4) throw new Error("Player name must be 4 characters or less");
   const bytes = new Uint8Array(4);
   const encoded = textEncoder.encode(player);
   bytes.set(encoded.slice(0, 32));
   return bytes;
}

/**
 * Transform UUID string to Uint8Array (16 bytes)
 */
export function uuidToU8Array(uuid: string): Uint8Array {
   // Remove hyphens from UUID
   const hex = uuid.replace(/-/g, "");
   const bytes = new Uint8Array(16);

   // Convert hex string to bytes
   for (let i = 0; i < 16; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
   }

   return bytes;
}

// /**
//  * Helper to transform bet data from user-friendly format to SDK format
//  */
// export function transformBetData(input: {
//    betId: string;
//    amount: bigint;
//    min_odds: number;
//    freebet_id: number;
//    is_sol_free: boolean;
//    frontend_id: number;
//    referral: number;
//    keep_open: boolean;
//    selections: Array<{
//       sport: number;
//       league: number;
//       event: bigint;
//       period: number;
//       mkt: number;
//       player: string;
//       side: number | boolean;
//       is_live: boolean;
//    }>;
// }): BetData {
//    return {
//       bet_id: uuidToU8Array(input.betId),
//       amount: input.amount,
//       min_odds: input.min_odds,
//       freebet_id: input.freebet_id,
//       is_sol_free: input.is_sol_free,
//       frontend_id: input.frontend_id,
//       referral: input.referral,
//       keep_open: input.keep_open,
//       selections: input.selections.map((s) => ({
//          sport: s.sport,
//          league: s.league,
//          event: s.event,
//          period: s.period,
//          mkt: s.mkt,
//          player: playerToBytes(s.player),
//          side: Number(s.side),
//          is_live: s.is_live,
//       })),
//    };
// }

/**
 * Transform U8Array to UUID string
 */
export function u8ArrayToUuid(bytes: Uint8Array): string {
   // Convert bytes to hex string
   const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

   // Format as UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20, 32),
   ].join("-");
}

/**
 * Transform Uint8Array player bytes back to string
 */
export function bytesToPlayer(playerBytes: Uint8Array): string {
   if(playerBytes.length !== 4) throw new Error("Byte array must be length 4");
   if(
      (playerBytes[0] === 0 && playerBytes[1] === 0 && playerBytes[2] === 0 && playerBytes[3] === 0)
   ) return "";
   // Decode to string
   return new TextDecoder().decode(playerBytes);
}