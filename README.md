# Purebet SDK

[![npm version](https://badge.fury.io/js/%40purebet%2Fpurebet-sdk.svg)](https://badge.fury.io/js/%40purebet%2Fpurebet-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A TypeScript SDK for interacting with the Purebet Solana betting platform.

## Features

- Complete betting operations - Build instructions for placing, canceling, and managing bets
- Multi-network support - Works with Solana mainnet and devnet
- Type safety - Full TypeScript support with strict typing
- Market decoding - Built-in market type and period decoding utilities
- Freebet support - Handle freebet operations

## Installation

```bash
npm install @purebet/purebet-sdk
```

## Quick Start

```typescript
import { 
  buildPlaceBetInstruction,
  buildCancelBetInstruction,
  buildPlaceFreebetInstruction,
  playerToBytes,
  uuidToU8Array,
  decodeMkt,
  decodePeriod,
  PROGRAM_ADDR,
  TOKEN_MINT_ADDR
} from '@purebet/purebet-sdk';

// Create bet data
const betData = {
  bet_id: uuidToU8Array(randomUUID()), //can use any method of UUID generation as long is it conforms to standard
  amount: BigInt(1000000), // 1 USDC (6 decimals)
  min_odds: 15000000, // 1.5x
  freebet_id: 0,
  is_sol_free: false,
  frontend_id: 1,
  referral: 0,
  keep_open: false,
  bet_token: 0,
  selections: [{
    sport: 1,
    league: 100,
    event: BigInt(12345),
    period: 0,
    mkt: 15,
    player: playerToBytes('HKan'), //4 letter abbr from API. Default is [0,0,0,0] for non-player markets
    side: true,
    is_live: false
  }]
};

// Build instruction to place a bet
const placeBetInstruction = await buildPlaceBetInstruction(
  'your_bettor_address',
  betData,
  'solana_devnet'
);

// Build instruction to cancel a bet
const cancelBetInstruction = await buildCancelBetInstruction(
  false, // isAdmin
  'bet_account_address',
  'bettor_address',
  'solana_devnet',
  false // isFreebet
);

// Build instruction to cancel a freebet (frontend is required)
const cancelFreebetInstruction = await buildCancelBetInstruction(
  false, // isAdmin
  'bet_account_address',
  'bettor_address',
  'solana_devnet',
  true, // isFreebet
  { id: 1, address: 'frontend_address' } // frontend (required when isFreebet is true)
);

// Decode market information
const marketInfo = decodeMkt(203, "Manchester United", "Chelsea");
const periodInfo = decodePeriod(0);
```

## Network Support

The SDK supports multiple Solana networks with network-specific addresses:

- **`solana_mainnet`** - Production deployment on Solana mainnet
- **`solana_devnet`** - Development and testing on Solana devnet

### Getting Network-Specific Constants

```typescript
import { PROGRAM_ADDR, TOKEN_MINT_ADDR } from '@purebet/purebet-sdk';

// Access mainnet addresses
const mainnetProgram = PROGRAM_ADDR.solana_mainnet;
const mainnetToken = TOKEN_MINT_ADDR.solana_mainnet;

// Access devnet addresses  
const devnetProgram = PROGRAM_ADDR.solana_devnet;
const devnetToken = TOKEN_MINT_ADDR.solana_devnet;
```

## API Reference

### Core Functions

#### `buildPlaceBetInstruction(bettor, betData, network?, serialise?)`
Build an instruction to place a bet.

**Parameters:**
- `bettor` - The bettor's address
- `betData` - BetData object containing bet details
- `network` - Target network (`'solana_mainnet'` or `'solana_devnet'`, defaults to mainnet)
- `serialise` - Whether to return serialized bytes (Uint8Array) or Instruction object (defaults to false)

**Returns:** Promise resolving to Instruction object or Uint8Array (when serialise is true)

#### `buildCancelBetInstruction(isAdmin, bet, bettor, network?, serialise?, isFreebet?, frontend?)`
Build an instruction to cancel a bet.

**Parameters:**
- `isAdmin` - Whether the cancellation is initiated by admin
- `bet` - The bet account address to cancel
- `bettor` - The bettor's address
- `network` - Target network (defaults to mainnet)
- `serialise` - Whether to return serialized bytes (Uint8Array) or Instruction object (defaults to false)
- `isFreebet` - Whether this is a freebet cancellation (defaults to false)
- `frontend` - Frontend configuration (required when isFreebet is true, optional otherwise)

**Returns:** Promise resolving to Instruction object or Uint8Array (when serialise is true)

**Note:** When `isFreebet` is `true`, the `frontend` parameter becomes mandatory.

#### `buildPlaceFreebetInstruction(bettor, betData, network?, serialise?, frontend?)`
Build an instruction to place a freebet.

**Parameters:**
- `bettor` - The bettor's address
- `betData` - BetData object containing bet details (must have freebet_id > 0)
- `network` - Target network (defaults to mainnet)
- `serialise` - Whether to return serialized bytes (Uint8Array) or Instruction object (defaults to false)
- `frontend` - Frontend configuration (optional, defaults to standard frontend)

**Returns:** Promise resolving to Instruction object or Uint8Array (when serialise is true)

### Instruction Serialization

All instruction building functions support a `serialise` parameter that allows you to get the instruction as serialized bytes instead of an Instruction object. This is useful for:

- **API Transmission**: Send instructions over HTTP APIs as binary data
- **Cross-Platform Integration**: Share instructions between different systems (use in old @solana/web3.js systems)

**Example:**
```typescript
// Get instruction as serialized bytes
const serializedInstruction = await buildPlaceBetInstruction(
  bettor,
  betData,
  'solana_devnet',
  true // serialise = true
);
```

### Utility Functions

#### `playerToBytes(player: string)`
Convert player 4 letter code string to Uint8Array for use in selections.

**Parameters:**
- `player` - Player name as string

**Returns:** Uint8Array (4 bytes)

#### `uuidToU8Array(uuid: string)`
Convert UUID string to Uint8Array for bet IDs.

**Parameters:**
- `uuid` - UUID string

**Returns:** Uint8Array (16 bytes)

#### `decodeMkt(mkt: number, home?: string, away?: string)`
Decode market type from number to human-readable format. Home and away team names can be added for enchanced output.

**Returns:** Object with `name`, `type`, `description`, `displayType` and optional `value`
**displayTypes:** 0 - binary market (e.g. Moneyline), 1 - binary market with array of values (e.g. Over/under 1.5,2.5,3.5), 2 - Back/lay markets which get grouped (e.g. Home/Draw/Away), 3 - One-sided markets which get grouped (e.g. FT-BTTS where only side0 is valid to bet on)


#### `decodePeriod(period: number, sport?: number)`
Decode period from number to readable format. Sport id can be added for enchanced output

**Returns:** String describing the period

### Constants

#### Network-Specific Addresses

```typescript
import {
  PROGRAM_ADDR,           // Main program addresses
  PROGRAM_AUTH_PDA_ADDR,  // Program authority PDA
  PROGRAM_FEE_ADDR,       // Fee collection address
  TOKEN_MINT_ADDR,        // Token mint addresses
  FREEBET_PROGRAM_ID,     // Freebet program addresses
  FRONTEND_ADDR,          // Frontend authority addresses
  ADMIN_ADDR              // Admin addresses
} from '@purebet/purebet-sdk';
```

#### System Programs
```typescript
import {
  TOKEN_PROGRAM_ADDR,           // Solana Token Program
  ASSOCIATED_TOKEN_PROGRAM_ID,  // Associated Token Program
  SYSTEM_PROGRAM_ADDR           // Solana System Program
} from '@purebet/purebet-sdk';
```

#### PDA Seeds
```typescript
import {
  BET_ACC_SEED,        // "bet"
  MM_PDA_SEED,         // "mm_pda_acc"
  FB_ACCOUNT_SEED,     // "freebet_account"
  FREEBET_AUTH_SEED    // "freebet_authority"
} from '@purebet/purebet-sdk';
```


## Support

- Email: purebetprotocol@gmail.com
- Issues: [GitHub Issues](https://github.com/purebet/purebet-sdk/issues)
- Telegram/Discord: pure_lmao

## Changelog

### v0.0.1
- Initial release
- Core instruction builders (place bet, cancel bet, place freebet)
- Multi-network support (mainnet/devnet)
- Market and period decoding utilities
- Complete TypeScript definitions
### v0.0.3
- add option to serialise the instructions
### v0.04
- add bet_token to codex
### v0.05
- fix user bet account filters to add unmatchedOnly param
### v0.06
- fix bet decoding
- add finding bet by betId
### v0.07
- update codex
- add get getOperationalStatus function
### v0.08
- add program config decoding to codex
- add function to get current program config
- remove placeholder for getting bet history from indexer db. Now in API.
- allow is_sol_free = true in bet instructions