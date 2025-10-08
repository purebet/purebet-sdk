import { Rpc, SolanaRpcApi } from "@solana/kit";
import { bytesToPlayer } from "./transforms";
import { getOperationalStatusCodec, OperationalStatus } from "../codex";
import { PROGRAM_AUTH_PDA_ADDR } from "../constants";

function numberToSide(number: number, home: string = "Home", away: string = "Away"): string {
   if(number === 1){
      return home;
   } else if(number === 2){
      return "Draw";
   } else if(number === 3){
      return away;
   }
   return "Unknown";
}

/**
 * Decode market type from number
 */
export function decodeMkt(
   mkt: number, 
   home: string = "Home",
   away: string = "Away"
): {name: string, type: string, description: string, sides: [string, string]|[true, null], displayType: number, value?: number|string} | undefined {
   if(mkt == 0){
      return {name: "Moneyline", type: "ML", description: "Moneyline", sides: [home, away], displayType: 0};
   } else if(mkt == 1){
      return {name: home+" Win", type: "1X2", description: "Home Win in Regular Time", sides: [home+" win", away+"/Draw"], displayType: 2};
   } else if(mkt == 2){
      return {name: "Draw", type: "1X2", description: "Draw in Regular Time", sides: ["Draw", home+"/"+away], displayType: 2};
   } else if(mkt == 3){
      return {name: away+" Win", type: "1X2", description: "Away Win in Regular Time", sides: [away+" win", home+"/Draw"], displayType: 2};
   } else if(mkt == 4){
      return {name: "Both Teams To Score", type: "BTTS", description: "Both Teams To Score", sides: ["Yes", "No"], displayType: 0};
   } else if (mkt >= 10 && mkt <= 50) {
      return {name: `Outcome ${mkt-10}`, type: "MSO", description: "Multi-Selection Outcome", value: mkt-10, sides: ["Win", "Not win"], displayType: 2};
   } else if (mkt >= 100 && mkt <= 300) {
      return {name: `Handicap ${(mkt-200)/2}`, type: "AH", description: "Handicap", value: (mkt-200)/2, sides: [home, away], displayType: 1};
   } else if (mkt >= 400 && mkt <= 450) {
      return {name: `Both Teams To Score (Yes) & Over ${(mkt-400)/2}`, type: "BTTS+OU", description: "Both Teams To Score (Yes) & Over/Under", value: (mkt-400)/2, sides: [true, null], displayType: 3};
   } else if (mkt >= 450 && mkt <= 500) {
      return {name: `Both Teams To Score (Yes) & Under ${(mkt-450)/2}`, type: "BTTS+OU", description: "Both Teams To Score (Yes) & Over/Under", value: (mkt-450)/2, sides: [true, null], displayType: 3};
   } else if (mkt >= 500 && mkt <= 550) {
      return {name: `Both Teams To Score (No) & Over ${(mkt-500)/2}`, type: "BTTS+OU", description: "Both Teams To Score (No) & Over/Under", value: (mkt-500)/2, sides: [true, null], displayType: 3};
   } else if (mkt >= 550 && mkt <= 600) {
      return {name: `Both Teams To Score (No) & Under ${(mkt-550)/2}`, type: "BTTS+OU", description: "Both Teams To Score (No) & Over/Under", value: (mkt-550)/2, sides: [true, null], displayType: 3};
   } else if (mkt >= 600 && mkt <= 650) {
      const HTWinner = numberToSide(parseInt(mkt.toString().substring(1, 2)), home, away);//the 2nd digit
      const FTWinner = numberToSide(parseInt(mkt.toString().substring(2, 3)), home, away);//the 3rd digit
      if(HTWinner === "Unknown" || FTWinner === "Unknown"){
         throw new Error("Invalid market, 2nd and 3rd digit must be 1, 2, or 3 (Home, Draw, Away)");
      }
      return {name: `${HTWinner}/${FTWinner}`, type: "HTFT", description: "Half Time/Full Time", value: `${HTWinner}/${FTWinner}`, sides: [true, null], displayType: 3};
   } else if (mkt >= 650 && mkt <= 700) {
      const FTWinner = numberToSide(parseInt(mkt.toString().substring(1, 2)), home, away);//the 2nd digit
      if(FTWinner === "Unknown"){
         throw new Error("Invalid market, 2nd digit must be 1, 2, or 3 (Home, Draw, Away)");
      }
      const thirdDigit = parseInt(mkt.toString().substring(2, 3));
      if(thirdDigit !== 0 && thirdDigit !== 1){
         throw new Error("Invalid market, 3rd digit must be 0 or 1 (Yes, No)");
      }
      const BTTS = thirdDigit === 0 ? "Yes" : "No"
      return {name: `${FTWinner} & ${BTTS}`, type: "FT+BTTS", description: "Full Time & Both Teams To Score", value: `${FTWinner}/${BTTS}`, sides: [true, null], displayType: 3};
   } else if (mkt >= 1000 && mkt <= 2000) {
      return {name: `Over/Under ${(mkt-1000)/2}`, type: "OU", description: "Over/Under", value: (mkt-1000)/2, sides: ["Over", "Under"], displayType: 1};
   } else if (mkt >= 2000 && mkt <= 3000) {
      return {name: `${home} over/under ${(mkt-2000)/2}`, type: "TOU", description: "Home over/under", value: (mkt-2000)/2, sides: ["Over", "Under"], displayType: 1};
   } else if (mkt >= 3000 && mkt <= 4000) {
      return {name: `${away} over/under ${(mkt-3000)/2}`, type: "TOU", description: "Away over/under", value: (mkt-3000)/2, sides: ["Over", "Under"], displayType: 1};
   } else if (mkt >= 5000 && mkt <= 5500) {
      return {name: `${home} win & over ${(mkt-5000)/2}`, type: "FT+OU", description: "Home win & over/under", value: (mkt-5000)/2, sides: [true, null], displayType: 3};
   } else if (mkt >= 5500 && mkt <= 6000) {
      return {name: `${home} win & under ${(mkt-5500)/2}`, type: "FT+OU", description: "Home win & over/under", value: (mkt-5500)/2, sides: [true, null], displayType: 3};
   } else if (mkt >= 6000 && mkt <= 6500) {
      return {name: `Draw & over ${(mkt-6000)/2}`, type: "FT+OU", description: "Draw & over/under", value: (mkt-6000)/2, sides: [true, null], displayType: 3};
   } else if (mkt >= 6500 && mkt <= 7000) {
      return {name: `Draw & under ${(mkt-6500)/2}`, type: "FT+OU", description: "Draw & over/under", value: (mkt-6500)/2, sides: [true, null], displayType: 3};
   } else if (mkt >= 7000 && mkt <= 7500) {
      return {name: `${away} win & over ${(mkt-7000)/2}`, type: "FT+OU", description: "Away win & over/under", value: (mkt-7000)/2, sides: [true, null], displayType: 3};
   } else if (mkt >= 7500 && mkt <= 8000) {
      return {name: `${away} win & under ${(mkt-7500)/2}`, type: "FT+OU", description: "Away win & over/under", value: (mkt-7500)/2, sides: [true, null], displayType: 3};
   } else if (mkt >= 10000 && mkt <= 11000) {
      //home score is the 2nd and 3rd digit, away score is the 4th and 5th digit
      const home = parseInt(mkt.toString().substring(1, 3));
      const away = parseInt(mkt.toString().substring(3, 5));
      return {name: `Correct Score ${home}-${away}`, type: "CS", description: "Correct Score", value: `${home}-${away}`, sides: [true, null], displayType: 3};
   } else if (mkt >= 11000 && mkt <= 65000) {
      if(mkt === 12000){
         return {name: "To Score", type: "PP", description: "To Score", sides: ["Yes", "No"], displayType: 0};
      }
      if(mkt === 57000){
         return {name: "First Goalscorer", type: "PP", description: "First Goalscorer", sides: ["Yes", "No"], displayType: 0};
      }
      if(mkt === 58000){
         return {name: "To Be Booked", type: "PP", description: "To Be Booked", sides: ["Yes", "No"], displayType: 0};
      }
      const playerPropType = playerPropArray[parseInt(mkt.toString().substring(0, 2))-11]!;
      const value = parseInt(mkt.toString().substring(3, 5));
      return {name: `${playerPropType} Over/Under ${value}`, type: "PP", description: `Player Prop: ${playerPropType}`, value: value, sides: ["Over", "Under"], displayType: 1};
   }
}


const playerPropArray = [
   "Points", "Goals", "Assists", "Saves", 
   "Home Runs", "Strikeouts", "Total Bases", "Pitching Out", "Hits", "Runs", "RBIs", "Stolen Bases", "Singles", "Doubles", "Triples", "Walks Issued", "Earned Runs", "Hits Allowed",
   "Rebounds", "Steals", "Turnovers", "Blocks", "Three-Point Field Goals", "Double Double", "Triple Double", "Points+Assists", "Points+Rebounds", "Assists+Rebounds", "Points+Rebounds+Assist",
   "Touchdowns", "Field Goals", "Rushing Yards", "Passing Yards", "Receiving Yards", "Rush Attempts", "Passing Attempts", "FG Attempts", "Rushes", "Receptions", "Completions", "Ints", "Ints Thrown", "Passing Touchdowns", 
   "Shots On Goal", "PP Points", "Blocked Shots", 
   "First Goalscorer", "Yellow Card", "Goals+Assists", "Red Card", "Shots", "Shots On Target", "Fouls", "Tackles", "Passes"
]

const sportIdTuples: [number, string][] = [
   [3, "Baseball"],
   [33, "Tennis"],
   [19, "Hockey"],
   [4, "Basketball"],
   [15, "American Football"],
   [12, "Esports"],
   [29, "Soccer"],
   [27, "Rugby Union"],
   [22,  "MMA"],
   [6, "Boxing"],
   [8, "Cricket"],
]

export function getSportName(sport: number): string {
   const sportTuple = sportIdTuples.find((tuple) => tuple[0] === sport);
   return sportTuple ? sportTuple[1] : "Unknown";
}

export function getSportId(sport: string): number {
   const sportTuple = sportIdTuples.find((tuple) => tuple[1] === sport);
   return sportTuple ? sportTuple[0] : -1;
}

/**
 * Decode period from number
 */
export function decodePeriod(period: number, sport?: number): {Longname: string, Shortname: string, description: string} | undefined {
   
   const sportInterval = (sport: number | undefined): [string, string] => {
      if(sport === 3){ //baseball
         return ["Inning", "I"];
      } else if(sport === 33){ //tennis
         return ["Set", "S"];
      } else if(sport === 19){ //hockey
         return ["Period", "P"];
      } else if(sport === 4){ //basketball
         return ["Quarter", "Q"];
      } else if(sport === 15){ //am foot
         return ["Quarter", "Q"];
      } else if(sport === 12){ //esports
         return ["Game", "G"]
      } else {
         return ["Interval", "I"];
      }
   }
   if(period === 0){
      return {Longname: "Full Match incl. Overtime", Shortname: "Full Game", description: ""};
   } else if(period === 1){
      return {Longname: "Full Match", Shortname: "Regulation", description: "Regulation time including injury time, not including overtime or extra time."};
   } else if(period === 2){
      return {Longname: "First Half", Shortname: "1st Half", description: "First Half"};
   } else if(period === 3){
      return {Longname: "Second Half", Shortname: "2nd Half", description: "Second Half"};
   } else if(period === 10){
      return {Longname: "To Win Outright", Shortname: "Outright win", description: "Win the competition"};
   } else if(Math.floor(period/10) === 1){
      return {Longname: `${sportInterval(sport)[0]} ${period-10}`, Shortname: `${sportInterval(sport)[1]} ${period-10}`, description: `Winner of ${sportInterval(sport)[0]} ${period-10} (only points scored in this period count)`};
   } else if(period === 21 && sport === 29){ //soccer
      return {Longname: "Extra time", Shortname: "ET", description: "Only goals scored in Extra Time count"};
   } else if (period === 21 && sport !== 29){
      return {Longname: "Overtime", Shortname: "OT", description: "Only points scored in Overtime count"};
   } else if (period === 22 && sport === 29){ //soccer
      return {Longname: "First half of Extra time", Shortname: "1H ET", description: "Only goals scored in First Half of Extra Time count"};
   } else if (period === 23 && sport === 29){ //soccer
      return {Longname: "Second half of Extra time", Shortname: "2H ET", description: "Only goals scored in Second Half of Extra Time count"};
   } else if (period === 24 && sport === 29){ //soccer
      return {Longname: "Penalty Shootout", Shortname: "Penalties", description: "Winner of the penalty shootout"};
   } else if (period === 25 && sport === 29){ //soccer
      return {Longname: "First 10 penalties", Shortname: "10 Penalties", description: "Winner of the first 10 penalties"};
   } else if (period === 30 && sport === 33){ //tennis
      return {Longname: "Games", Shortname: "Games", description: "Games"};
   } else if (Math.floor(period/10) === 3 && sport === 33){ //tennis
      return {Longname: `Set ${period-30} Games`, Shortname: `Set ${period-30} Games`, description: `Set ${period-30} Games`};
   } 
}

/**
 * Format bet selections for display
 */
export function formatSelection(selection: {
   sport: number;
   league: number;
   event: bigint;
   period: number;
   mkt: number;
   player: Uint8Array;
   side: boolean;
   is_live: boolean;
}): string {
   const market = decodeMkt(selection.mkt);
   const period = decodePeriod(selection.period, selection.sport);
   const player = bytesToPlayer(selection.player);
   const side = selection.side ? market?.sides[0] : market?.sides[1];
   return `${player === "" ? player + " - " : ""}${market?.name} - ${period?.Longname} - ${side} ${selection.is_live ? " (LIVE)" : ""}`;
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
