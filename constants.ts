import { Address } from "@solana/kit";

// Program addresses
export const PROGRAM_ADDR = {
   solana_mainnet: "MAINNET_PROGRAM_ADDR_HERE" as Address,
   solana_devnet: "8rtbc6yZ8fvDhQaK2nrxraUpVVQM6ySFuBpzkqXLYz24" as Address,
};

export const PROGRAM_AUTH_PDA_ADDR = {
   solana_mainnet: "MAINNET_PROGRAM_AUTH_PDA_ADDR_HERE" as Address,
   solana_devnet: "2wMakfeDrHWMB7u3WQs9wV8FbmRBazcCgmB45oCuoJpA" as Address,
};

export const PROGRAM_FEE_ADDR = {
   solana_mainnet: "MAINNET_PROGRAM_FEE_ADDR_HERE" as Address,
   solana_devnet: "8uvG33CkKKLZLbc4aphwtqgjkMBrAZqQqrXLcHnDWhCp" as Address,
};

// Token addresses
export const TOKEN_MINT_ADDR = {
   solana_mainnet: "MAINNET_TOKEN_MINT_ADDR_HERE" as Address,
   solana_devnet: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr" as Address,
};

export const TOKEN_PROGRAM_ADDR = {
   solana_mainnet: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" as Address,
   solana_devnet: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" as Address,
};

export const ASSOCIATED_TOKEN_PROGRAM_ID = {
   solana_mainnet: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL" as Address,
   solana_devnet: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL" as Address,
};

// System program
export const SYSTEM_PROGRAM_ADDR = {
   solana_mainnet: "11111111111111111111111111111111" as Address,
   solana_devnet: "11111111111111111111111111111111" as Address,
};

// Sol free signer id
export const SOL_FREE_ADDR = {
   solana_mainnet: "MAINNET_SOL_FREE_SIGNER_ID_HERE" as Address,
   solana_devnet: "612L6VLWCfsyb6CidqDHg7pRxsUEbTKAzMeeLjy65NVV" as Address,
};

// Freebet program
export const FREEBET_PROGRAM_ID = {
   solana_mainnet: "MAINNET_FREEBET_PROGRAM_ID_HERE" as Address,
   solana_devnet: "DpksNR6nnqrXzqSraTjS8qGUtPZUrKBZjxJu6NZUE8Hk" as Address,
};

export const FRONTEND_ADDR = {
   solana_mainnet: "MAINNET_FRONTEND_ADDR_HERE" as Address,
   solana_devnet: "7mjvQ5vvHUvj8B7uDM23ZitNEqT7Gqim9Yz8kHgWwhAd" as Address,
};

// Admin address
export const ADMIN_ADDR = {
   solana_mainnet: "MAINNET_ADMIN_ADDR_HERE" as Address,
   solana_devnet: "AdmkgFyD3RhJfELVNv7VaXnDbxrCEqZGEYAfGVUhTVnj" as Address,
};

// PDA seeds
export const BET_ACC_SEED = "bet";
export const MM_PDA_SEED = "mm_pda_acc";
export const FB_ACCOUNT_SEED = "freebet_account";
export const FREEBET_AUTH_SEED = "freebet_authority";
