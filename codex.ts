// Solana Kit codec definitions for BetData, Bet, Offer, and Actions (core variants)
import {
   Codec,
   Encoder,
   Decoder,
   combineCodec,
   getStructEncoder,
   getStructDecoder,
   getTupleEncoder,
   getTupleDecoder,
   getDiscriminatedUnionEncoder,
   getDiscriminatedUnionDecoder,
   getBooleanEncoder,
   getBooleanDecoder,
   getU8Encoder,
   getU8Decoder,
   getU16Encoder,
   getU16Decoder,
   getU32Encoder,
   getU32Decoder,
   getU64Encoder,
   getU64Decoder,
   getI64Encoder,
   getI64Decoder,
   getBytesEncoder,
   getBytesDecoder,
   addEncoderSizePrefix,
   addDecoderSizePrefix,
   fixEncoderSize,
   fixDecoderSize,
   transformEncoder,
   transformDecoder,
   getArrayEncoder,
   getArrayDecoder,
   getBase58Codec,
} from '@solana/codecs';
import { getAddressEncoder, getAddressDecoder, Address, Instruction, AccountRole } from '@solana/kit';

// --- TypeScript type definitions mirroring Rust, using Address and Uint8Array for codec compatibility ---

export type Selection = {
   sport: number; // u8
   league: number; // u16
   event: bigint; // u64
   period: number; // u8
   mkt: number; // u16
   player: Uint8Array; // [u8; 4]
   side: boolean; // bool
   is_live: boolean; // bool
};

export type Matcher = {
   offer_id: bigint; // u64
   addr: Address; // Pubkey
   amount: bigint; // u64
   odds: number; // u32
};

export type Bet = {
   bet_id: Uint8Array; // [u8; 16]
   requester: Address; // Pubkey
   requested_stake: bigint; // u64
   requested_odds: number; // u32
   matched_stake: bigint; // u64
   matched_odds: number; // u32
   freebet_id: number; // u32
   is_sol_free: boolean;
   keep_open: boolean;
   bet_token: number; //u8
   placed_at: bigint; // i64
   frontend_id: number; // u8
   referral: number; // u32
   selections: Selection[];
   matchers: Matcher[];
};

export type BetData = {
   bet_id: Uint8Array; // [u8; 16]
   amount: bigint; // u64
   min_odds: number; // u32
   freebet_id: number; // u32
   is_sol_free: boolean;
   frontend_id: number; // u8
   referral: number; // u32
   keep_open: boolean;
   bet_token: number; //u8
   selections: Selection[];
};

export type Offer = {
   offer_id: bigint; // u64
   max_amount: bigint; // u64
   max_odds: number; // u32
   expiry: bigint; // u64
   selections: Selection[];
};

export type MMOfferAccount = {
   existing_offers: Map<bigint, bigint>;
};

// --- Additional type definitions for all actions ---

export type OperationalStatus = 
   | { __kind: 'Unknown' }
   | { __kind: 'Active' }
   | { __kind: 'MMingPaused' }
   | { __kind: 'PreBettingPaused' }
   | { __kind: 'LiveBettingPaused' }
   | { __kind: 'BettingPaused' }
   | { __kind: 'Paused' };


// --- Codec definitions ---

function fixedBytesDecoder(size: number): Decoder<Uint8Array> {
   return transformDecoder(fixDecoderSize(getBytesDecoder(), size), (v) => new Uint8Array(v as ArrayLike<number>));
}

export const getInstructionCodec = (): Codec<Instruction> =>
   combineCodec(getInstructionEncoder(), getInstructionDecoder());

export const getInstructionEncoder = (): Encoder<Instruction> =>
   transformEncoder(
      getStructEncoder([
         ['programAddress', getBase58Codec()],
         ['accounts', getArrayEncoder(getStructEncoder([
            ['address', getBase58Codec()],
            ['role', getU8Encoder()],
         ]))],
         ['data', getArrayEncoder(getU8Encoder())],
      ]),
      (instruction: Instruction) => ({
         programAddress: instruction.programAddress,
         accounts: (instruction.accounts || []).map(account => ({
            address: account.address,
            role: account.role,
         })),
         data: Array.from(instruction.data || new Uint8Array()),
      })
   );

export const getInstructionDecoder = (): Decoder<Instruction> =>
   transformDecoder(
      getStructDecoder([
         ['programAddress', getBase58Codec()],
         ['accounts', getArrayDecoder(getStructDecoder([
            ['address', getBase58Codec()],
            ['role', getU8Decoder()],
         ]))],
         ['data', getArrayDecoder(getU8Decoder())],
      ]),
      (decoded) => ({
         programAddress: decoded.programAddress as Address,
         accounts: decoded.accounts.map(account => ({
            address: account.address as Address,
            role: account.role as AccountRole,
         })),
         data: new Uint8Array(decoded.data),
      })
   );

// Selection codec
const getSelectionEncoder = (): Encoder<Selection> =>
   getStructEncoder([
      ['sport', getU8Encoder()],
      ['league', getU16Encoder()],
      ['event', getU64Encoder()],
      ['period', getU8Encoder()],
      ['mkt', getU16Encoder()],
      ['player', fixEncoderSize(getBytesEncoder(), 4)],
      ['side', getBooleanEncoder()],
      ['is_live', getBooleanEncoder()],
   ]);
const getSelectionDecoder = (): Decoder<Selection> =>
   getStructDecoder([
      ['sport', getU8Decoder()],
      ['league', getU16Decoder()],
      ['event', getU64Decoder()],
      ['period', getU8Decoder()],
      ['mkt', getU16Decoder()],
      ['player', fixedBytesDecoder(4)],
      ['side', getBooleanDecoder()],
      ['is_live', getBooleanDecoder()],
   ]);
export const getSelectionCodec = (): Codec<Selection> =>
   combineCodec(getSelectionEncoder(), getSelectionDecoder());

// Matcher codec
const getMatcherEncoder = (): Encoder<Matcher> =>
   getStructEncoder([
      ['offer_id', getU64Encoder()],
      ['addr', getAddressEncoder()],
      ['amount', getU64Encoder()],
      ['odds', getU32Encoder()],
   ]);
const getMatcherDecoder = (): Decoder<Matcher> =>
   getStructDecoder([
      ['offer_id', getU64Decoder()],
      ['addr', getAddressDecoder()],
      ['amount', getU64Decoder()],
      ['odds', getU32Decoder()],
   ]);
export const getMatcherCodec = (): Codec<Matcher> =>
   combineCodec(getMatcherEncoder(), getMatcherDecoder());

// Bet codec
const getBetEncoder = (): Encoder<Bet> =>
   getStructEncoder([
      ['bet_id', fixEncoderSize(getBytesEncoder(), 16)],
      ['requester', getAddressEncoder()],
      ['requested_stake', getU64Encoder()],
      ['requested_odds', getU32Encoder()],
      ['matched_stake', getU64Encoder()],
      ['matched_odds', getU32Encoder()],
      ['freebet_id', getU32Encoder()],
      ['is_sol_free', getBooleanEncoder()],
      ['keep_open', getBooleanEncoder()],
      ['bet_token', getU8Encoder()],
      ['placed_at', getI64Encoder()],
      ['frontend_id', getU8Encoder()],
      ['referral', getU32Encoder()],
      ['selections', getArrayEncoder(getSelectionEncoder())],
      ['matchers', getArrayEncoder(getMatcherEncoder())],
   ]);
const getBetDecoder = (): Decoder<Bet> =>
   getStructDecoder([
      ['bet_id', fixedBytesDecoder(16)],
      ['requester', getAddressDecoder()],
      ['requested_stake', getU64Decoder()],
      ['requested_odds', getU32Decoder()],
      ['matched_stake', getU64Decoder()],
      ['matched_odds', getU32Decoder()],
      ['freebet_id', getU32Decoder()],
      ['is_sol_free', getBooleanDecoder()],
      ['keep_open', getBooleanDecoder()],
      ['bet_token', getU8Decoder()],
      ['placed_at', getI64Decoder()],
      ['frontend_id', getU8Decoder()],
      ['referral', getU32Decoder()],
      ['selections', getArrayDecoder(getSelectionDecoder())],
      ['matchers', getArrayDecoder(getMatcherDecoder())],
   ]);
export const getBetCodec = (): Codec<Bet> =>
   combineCodec(getBetEncoder(), getBetDecoder());

// BetData codec
const getBetDataEncoder = (): Encoder<BetData> =>
   getStructEncoder([
      ['bet_id', fixEncoderSize(getBytesEncoder(), 16)],
      ['amount', getU64Encoder()],
      ['min_odds', getU32Encoder()],
      ['freebet_id', getU32Encoder()],
      ['is_sol_free', getBooleanEncoder()],
      ['frontend_id', getU8Encoder()],
      ['referral', getU32Encoder()],
      ['keep_open', getBooleanEncoder()],
      ['bet_token', getU8Encoder()],
      ['selections', getArrayEncoder(getSelectionEncoder())],
   ]);
const getBetDataDecoder = (): Decoder<BetData> =>
   getStructDecoder([
      ['bet_id', fixedBytesDecoder(16)],
      ['amount', getU64Decoder()],
      ['min_odds', getU32Decoder()],
      ['freebet_id', getU32Decoder()],
      ['is_sol_free', getBooleanDecoder()],
      ['frontend_id', getU8Decoder()],
      ['referral', getU32Decoder()],
      ['keep_open', getBooleanDecoder()],
      ['bet_token', getU8Decoder()],
      ['selections', getArrayDecoder(getSelectionDecoder())],
   ]);
export const getBetDataCodec = (): Codec<BetData> =>
   combineCodec(getBetDataEncoder(), getBetDataDecoder());

// Offer codec
const getOfferEncoder = (): Encoder<Offer> =>
   getStructEncoder([
      ['offer_id', getU64Encoder()],
      ['max_amount', getU64Encoder()],
      ['max_odds', getU32Encoder()],
      ['expiry', getU64Encoder()],
      ['selections', getArrayEncoder(getSelectionEncoder())],
   ]);
const getOfferDecoder = (): Decoder<Offer> =>
   getStructDecoder([
      ['offer_id', getU64Decoder()],
      ['max_amount', getU64Decoder()],
      ['max_odds', getU32Decoder()],
      ['expiry', getU64Decoder()],
      ['selections', getArrayDecoder(getSelectionDecoder())],
   ]);
export const getOfferCodec = (): Codec<Offer> =>
   combineCodec(getOfferEncoder(), getOfferDecoder());

const getMMOfferAccountEncoder = (): Encoder<MMOfferAccount> =>
   getStructEncoder([
      [
         'existing_offers',
         // Map<bigint, bigint> -> Array<[bigint, bigint]>
         transformEncoder(
            getArrayEncoder(getTupleEncoder([getU64Encoder(), getU64Encoder()])),
            (map: Map<bigint, bigint>) => Array.from(map.entries())
         ),
      ],
   ]);

const getMMOfferAccountDecoder = (): Decoder<MMOfferAccount> =>
   getStructDecoder([
      [
         'existing_offers',
         // Array<[bigint, bigint]> -> Map<bigint, bigint>
         transformDecoder(
            getArrayDecoder(getTupleDecoder([getU64Decoder(), getU64Decoder()])),
            (arr: ReadonlyArray<readonly [bigint, bigint]>) => new Map(arr.map(([k, v]) => [k, v] as [bigint, bigint]))
         ),
      ],
   ]);

export const getMMOfferAccountCodec = (): Codec<MMOfferAccount> =>
   combineCodec(getMMOfferAccountEncoder(), getMMOfferAccountDecoder());

// --- Additional codec definitions ---

// OperationalStatus codec
const getOperationalStatusEncoder = (): Encoder<OperationalStatus> =>
   transformEncoder(
      getU8Encoder(),
      (status: OperationalStatus) => {
         switch (status.__kind) {
            case 'Unknown': return 0;
            case 'Active': return 1;
            case 'MMingPaused': return 2;
            case 'PreBettingPaused': return 3;
            case 'LiveBettingPaused': return 4;
            case 'BettingPaused': return 5;
            case 'Paused': return 6;
            default: return 0;
         }
      }
   );
const getOperationalStatusDecoder = (): Decoder<OperationalStatus> =>
   transformDecoder(
      getU8Decoder(),
      (value: number): OperationalStatus => {
         switch (value) {
            case 0: return { __kind: 'Unknown' };
            case 1: return { __kind: 'Active' };
            case 2: return { __kind: 'MMingPaused' };
            case 3: return { __kind: 'PreBettingPaused' };
            case 4: return { __kind: 'LiveBettingPaused' };
            case 5: return { __kind: 'BettingPaused' };
            case 6: return { __kind: 'Paused' };
            default: return { __kind: 'Unknown' };
         }
      }
   );
export const getOperationalStatusCodec = (): Codec<OperationalStatus> =>
   combineCodec(getOperationalStatusEncoder(), getOperationalStatusDecoder());

// ProgramConfig type and codec
export type ProgramConfig = {
   operational_status: OperationalStatus;
   flat_fee: bigint; // u64
   place_fee: number; // u32
   win_fee: number; // u32
   cancellation_delay: bigint; // i64
};

const getProgramConfigEncoder = (): Encoder<ProgramConfig> =>
   getStructEncoder([
      ['operational_status', getOperationalStatusEncoder()],
      ['flat_fee', getU64Encoder()],
      ['place_fee', getU32Encoder()],
      ['win_fee', getU32Encoder()],
      ['cancellation_delay', getI64Encoder()],
   ]);
const getProgramConfigDecoder = (): Decoder<ProgramConfig> =>
   getStructDecoder([
      ['operational_status', getOperationalStatusDecoder()],
      ['flat_fee', getU64Decoder()],
      ['place_fee', getU32Decoder()],
      ['win_fee', getU32Decoder()],
      ['cancellation_delay', getI64Decoder()],
   ]);
export const getProgramConfigCodec = (): Codec<ProgramConfig> =>
   combineCodec(getProgramConfigEncoder(), getProgramConfigDecoder());

// --- Actions enum ---
export type Actions =
   | { __kind: 'PlaceBet'; value: BetData }
   | { __kind: 'PlaceFreeBet'; value: BetData }
   | { __kind: 'CancelBet'; value: boolean }
   | { __kind: 'MatchBet'; value: { amount: bigint; signature: Uint8Array; signer_pubkey: Uint8Array; offer: Offer } }
   | { __kind: 'SettleBet'; value: { is_modified_payout: boolean; payout: bigint; results: Uint8Array } }
   | { __kind: 'InitMM' }
   | { __kind: 'MmWithdraw'; value: bigint }


const getActionsEncoder = (): Encoder<Actions> =>
   getDiscriminatedUnionEncoder(
      [
         ['PlaceBet', getStructEncoder([['value', getBetDataEncoder()]])],
         ['PlaceFreeBet', getStructEncoder([['value', getBetDataEncoder()]])],
         ['CancelBet', getStructEncoder([['value', getBooleanEncoder()]])],
         [
            'MatchBet',
            getStructEncoder([
               [
                  'value',
                  getStructEncoder([
                     ['amount', getU64Encoder()],
                     ['signature', fixEncoderSize(getBytesEncoder(), 64)],
                     ['signer_pubkey', fixEncoderSize(getBytesEncoder(), 32)],
                     ['offer', getOfferEncoder()],
                  ]),
               ],
            ]),
         ],
         [
            'SettleBet',
            getStructEncoder([
               [
                  'value',
                  getStructEncoder([
                     ['is_modified_payout', getBooleanEncoder()],
                     ['payout', getU64Encoder()],
                     ['results', addEncoderSizePrefix(getBytesEncoder(), getU32Encoder())],
                  ]),
               ],
            ]),
         ],
         ['InitMM', getStructEncoder([])],
         ['MmWithdraw', getStructEncoder([['value', getU64Encoder()]])]
      ],
      { size: getU8Encoder() }
   );

const getActionsDecoder = (): Decoder<Actions> =>
   getDiscriminatedUnionDecoder(
      [
         ['PlaceBet', getStructDecoder([['value', getBetDataDecoder()]])],
         ['PlaceFreeBet', getStructDecoder([['value', getBetDataDecoder()]])],
         ['CancelBet', getStructDecoder([['value', getBooleanDecoder()]])],
         [
            'MatchBet',
            getStructDecoder([
               [
                  'value',
                  getStructDecoder([
                     ['amount', getU64Decoder()],
                     ['signature', fixedBytesDecoder(64)],
                     ['signer_pubkey', fixedBytesDecoder(32)],
                     ['offer', getOfferDecoder()],
                  ]),
               ],
            ]),
         ],
         [
            'SettleBet',
            getStructDecoder([
               [
                  'value',
                  getStructDecoder([
                     ['is_modified_payout', getBooleanDecoder()],
                     ['payout', getU64Decoder()],
                     ['results', transformDecoder(addDecoderSizePrefix(getBytesDecoder(), getU32Decoder()), (v) => new Uint8Array(v as ArrayLike<number>))],
                  ]),
               ],
            ]),
         ],
         ['InitMM', getStructDecoder([])],
         ['MmWithdraw', getStructDecoder([['value', getU64Decoder()]])]
      ],
      { size: getU8Decoder() }
   );

export const getActionsCodec = (): Codec<Actions> =>
   combineCodec(getActionsEncoder(), getActionsDecoder());

// --- End of codex ---
