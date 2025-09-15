// Instructions
export { buildPlaceBetInstruction } from "./instructions/placeBet";
export { buildPlaceFreebetInstruction } from "./instructions/placeFreebet";
export { buildCancelBetInstruction } from "./instructions/cancelBet";

// Account utilities
export {
   decodeBetAccount,
   getUserBetsOnchain,
   getAllBetAccounts,
   getBetAccount,
   type DecodedBetAccount,
} from "./utils/accounts";

// Decode utilities
export { decodeMkt, decodePeriod, formatSelection } from "./utils/decode";

// Indexer utilities
export {
   getUserBetsFromIndexer,
   getBetHistory,
} from "./utils/indexer";

// Transform utilities
export {
   playerToBytes,
   uuidToU8Array,
   // transformBetData,
} from "./utils/transforms";

// Re-export types from codex
export type { BetData, Selection, Bet, Offer, Matcher } from "./codex";
