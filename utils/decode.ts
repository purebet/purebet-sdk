import { propsByMktValue } from "./playerProps";
import { bytesToPlayer } from "./transforms";

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
): {name: string, type: string, description: string, groupTitle: string, sides: [string, string]|[true, null], displayType: number, value?: number|string, details?: string} | undefined {
   if(mkt == 0){
      return {name: "Moneyline", type: "ML", description: "Moneyline", groupTitle: "Moneyline", sides: [home, away], displayType: 0};
   } else if(mkt == 1){
      return {name: home+" Win", type: "1X2", description: "Home Win in Regular Time", groupTitle: "Winner", sides: [home+" win", away+"/Draw"], displayType: 2};
   } else if(mkt == 2){
      return {name: "Draw", type: "1X2", description: "Draw in Regular Time", groupTitle: "Winner", sides: ["Draw", home+"/"+away], displayType: 2};
   } else if(mkt == 3){
      return {name: away+" Win", type: "1X2", description: "Away Win in Regular Time", groupTitle: "Winner", sides: [away+" win", home+"/Draw"], displayType: 2};
   } else if(mkt == 4){
      return {name: "Both Teams To Score", type: "BTTS", description: "Both Teams To Score", groupTitle: "Both Teams To Score", sides: ["Yes", "No"], displayType: 0};
   } else if (mkt >= 10 && mkt <= 50) {
      return {name: `Outcome ${mkt-10}`, type: "MSO", description: "Multi-Selection Outcome", groupTitle: "Result", value: mkt-10, sides: ["Win", "Not win"], displayType: 2};
   } else if (mkt >= 100 && mkt < 300) {                                                                                                                             //string adds the "-"
      return {name: `Handicap ${(mkt-200)/2}`, type: "AH", description: "Handicap", groupTitle: "Handicap", value: (mkt-200)/2, sides: [`${home} ${mkt > 200 ? "+" : ""}${((mkt-200)/2).toFixed(1)}`, `${away} ${mkt > 200 ? "" : "+"}${((mkt-200)/-2).toFixed(1)}`], displayType: 1};
   } else if (mkt >= 400 && mkt < 450) {
      return {name: `Both Teams To Score (Yes) & Over ${(mkt-400)/2}`, type: "BTTS+OU", description: "Both Teams To Score (Yes) & Over/Under", groupTitle: "Both Teams To Score and Over/Under", value: (mkt-400)/2, sides: [true, null], displayType: 3};
   } else if (mkt >= 450 && mkt < 500) {
      return {name: `Both Teams To Score (Yes) & Under ${(mkt-450)/2}`, type: "BTTS+OU", description: "Both Teams To Score (Yes) & Over/Under", groupTitle: "Both Teams To Score and Over/Under", value: (mkt-450)/2, sides: [true, null], displayType: 3};
   } else if (mkt >= 500 && mkt < 550) {
      return {name: `Both Teams To Score (No) & Over ${(mkt-500)/2}`, type: "BTTS+OU", description: "Both Teams To Score (No) & Over/Under", groupTitle: "Both Teams To Score and Over/Under", value: (mkt-500)/2, sides: [true, null], displayType: 3};
   } else if (mkt >= 550 && mkt < 600) {
      return {name: `Both Teams To Score (No) & Under ${(mkt-550)/2}`, type: "BTTS+OU", description: "Both Teams To Score (No) & Over/Under", groupTitle: "Both Teams To Score and Over/Under", value: (mkt-550)/2, sides: [true, null], displayType: 3};
   } else if (mkt >= 600 && mkt < 650) {
      const HTWinner = numberToSide(parseInt(mkt.toString().substring(1, 2)), home, away);//the 2nd digit
      const FTWinner = numberToSide(parseInt(mkt.toString().substring(2, 3)), home, away);//the 3rd digit
      if(HTWinner === "Unknown" || FTWinner === "Unknown"){
         throw new Error("Invalid market, 2nd and 3rd digit must be 1, 2, or 3 (Home, Draw, Away)");
      }
      return {name: `${HTWinner}/${FTWinner}`, type: "HTFT", description: "Half Time/Full Time", groupTitle: "Half Time/Full Time", value: `${HTWinner}/${FTWinner}`, sides: [true, null], displayType: 3};
   } else if (mkt >= 650 && mkt < 700) {
      const FTWinner = numberToSide(parseInt(mkt.toString().substring(1, 2)) - 4, home, away);//the 2nd digit
      if(FTWinner === "Unknown"){
         throw new Error("Invalid market, 2nd digit must be 1, 2, or 3 (Home, Draw, Away)");
      }
      const thirdDigit = parseInt(mkt.toString().substring(2, 3));
      if(thirdDigit !== 0 && thirdDigit !== 1){
         throw new Error("Invalid market, 3rd digit must be 0 or 1 (Yes, No)");
      }
      const BTTS = thirdDigit === 0 ? "Yes" : "No"
      return {name: `${FTWinner} & ${BTTS}`, type: "FT+BTTS", description: "Full Time & Both Teams To Score", groupTitle: "Full Time & Both Teams To Score", value: `${FTWinner}/${BTTS}`, sides: [true, null], displayType: 3};
   } else if (mkt >= 1000 && mkt < 2000) {
      return {name: `Over/Under ${(mkt-1000)/2}`, type: "OU", description: "Over/Under", groupTitle: "Over/Under", value: (mkt-1000)/2, sides: [`Over ${((mkt-1000)/2).toFixed(1)}`, `Under ${((mkt-1000)/2).toFixed(1)}`], displayType: 1};
   } else if (mkt >= 2000 && mkt < 3000) {
      return {name: `${home} Over/Under ${(mkt-2000)/2}`, type: "TOU", description: "Home Over/Under", groupTitle: "Team Over/Under", value: (mkt-2000)/2, sides: [`Over ${((mkt-2000)/2).toFixed(1)}`, `Under ${((mkt-2000)/2).toFixed(1)}`], displayType: 1};
   } else if (mkt >= 3000 && mkt < 4000) {
      return {name: `${away} Over/Under ${(mkt-3000)/2}`, type: "TOU", description: "Away Over/Under", groupTitle: "Team Over/Under", value: (mkt-3000)/2, sides: [`Over ${((mkt-3000)/2).toFixed(1)}`, `Under ${((mkt-3000)/2).toFixed(1)}`], displayType: 1};
   } else if (mkt >= 5000 && mkt < 5500) {
      return {name: `${home} Win & Over/Under ${(mkt-5000)/2}`, type: "FT+OU", description: "Home win & Over/Under", groupTitle: "Winner & Over/Under", value: (mkt-5000)/2, sides: [true, null], displayType: 3};
   } else if (mkt >= 5500 && mkt < 6000) {
      return {name: `${home} Win & Under ${(mkt-5500)/2}`, type: "FT+OU", description: "Home win & Over/Under", groupTitle: "Winner & Over/Under", value: (mkt-5500)/2, sides: [true, null], displayType: 3};
   } else if (mkt >= 6000 && mkt < 6500) {
      return {name: `Draw & Over ${(mkt-6000)/2}`, type: "FT+OU", description: "Draw & Over/Under", groupTitle: "Winner & Over/Under", value: (mkt-6000)/2, sides: [true, null], displayType: 3};
   } else if (mkt >= 6500 && mkt < 7000) {
      return {name: `Draw & Under ${(mkt-6500)/2}`, type: "FT+OU", description: "Draw & Over/Under", groupTitle: "Winner & Over/Under", value: (mkt-6500)/2, sides: [true, null], displayType: 3};
   } else if (mkt >= 7000 && mkt < 7500) {
      return {name: `${away} Win & Over ${(mkt-7000)/2}`, type: "FT+OU", description: "Away win & Over/Under", groupTitle: "Winner & Over/Under", value: (mkt-7000)/2, sides: [true, null], displayType: 3};
   } else if (mkt >= 7500 && mkt < 8000) {
      return {name: `${away} Win & Under ${(mkt-7500)/2}`, type: "FT+OU", description: "Away win & Over/Under", groupTitle: "Winner & Over/Under", value: (mkt-7500)/2, sides: [true, null], displayType: 3};
   } else if (mkt >= 10000 && mkt < 11000) {
      //home score is the 2nd and 3rd digit, away score is the 4th and 5th digit
      const home = parseInt(mkt.toString().substring(1, 3));
      const away = parseInt(mkt.toString().substring(3, 5));
      return {name: `Correct Score ${home}-${away}`, type: "CS", description: "Correct Score", groupTitle: "Correct Score", value: `${home}-${away}`, sides: [true, null], displayType: 3};
   } else if (mkt >= 11000 && mkt < 65535) {
      //round mkt down to nearest 500
      let startingValue = Math.floor(mkt/500) * 500;
      //fix for passing yards because it can be more than 250 yards
      if(startingValue == 42500) startingValue = 42000;
      const playerProp = propsByMktValue.get(startingValue);
      if(!playerProp){
         throw new Error("Invalid player prop market, market value must be between 11000 and 65535");
      }
      const value = Math.round((mkt - startingValue)/2 * 10)/10;
      return {name: `${playerProp.prettyName} Over/Under ${value}`, type: "PP", description: `${playerProp.prettyName}`, groupTitle: "Player Prop", value: value, sides: [`Over ${value.toFixed(1)}`, `Under ${value.toFixed(1)}`], displayType: 1, details: playerProp.details ?? undefined};
   } else {
      throw new Error("Invalid market, market value must be between 0 and 65535");
   }
}

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
   [101, "League of Legends"],
   [104, "Dota 2"],
   [103, "Counter Strike"],
   [126, "Valorant"],
   [124, "Rainbow Six Siege"],
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
export function decodePeriod(period: number, sport?: number): {Longname: string, Shortname: string, abbr: string, description: string} | undefined {
   
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
      } else if(sport && sport > 100){ //esports
         return ["Map", "M"]
      }else {
         return ["Interval", "I"];
      }
   }
   if(period === 0){
      return {Longname: "Full Match incl. Overtime", Shortname: "Full Game", abbr: "FT+OT", description: ""};
   } else if(period === 1){
      return {Longname: "Full Match", Shortname: "Regulation", abbr: "FT", description: "Regulation time including injury time, not including overtime or extra time."};
   } else if(period === 2){
      return {Longname: "First Half", Shortname: "1st Half", abbr: "1H", description: "First Half"};
   } else if(period === 3){
      return {Longname: "Second Half", Shortname: "2nd Half", abbr: "2H", description: "Second Half"};
   } else if(period === 10){
      return {Longname: "To Win Outright", Shortname: "Outright win", abbr: "OW", description: "Win the competition"};
   } else if(Math.floor(period/10) === 1){
      return {Longname: `${sportInterval(sport)[0]} ${period-10}`, Shortname: `${sportInterval(sport)[1]} ${period-10}`, abbr: `${sportInterval(sport)[1]}${period-10}`, description: `Winner of ${sportInterval(sport)[0]} ${period-10} (only points scored in this period count)`};
   } else if(period === 21 && sport === 29){ //soccer
      return {Longname: "Extra time", Shortname: "ET", abbr: "ET", description: "Only goals scored in Extra Time count"};
   } else if (period === 21 && sport !== 29){
      return {Longname: "Overtime", Shortname: "OT", abbr: "OT", description: "Only points scored in Overtime count"};
   } else if (period === 22 && sport === 29){ //soccer
      return {Longname: "First half of Extra time", Shortname: "1H ET", abbr: "1H ET", description: "Only goals scored in First Half of Extra Time count"};
   } else if (period === 23 && sport === 29){ //soccer
      return {Longname: "Second half of Extra time", Shortname: "2H ET", abbr: "2H ET", description: "Only goals scored in Second Half of Extra Time count"};
   } else if (period === 24 && sport === 29){ //soccer
      return {Longname: "Penalty Shootout", Shortname: "Penalties", abbr: "Pen", description: "Winner of the penalty shootout"};
   } else if (period === 25 && sport === 29){ //soccer
      return {Longname: "First 10 penalties", Shortname: "10 Penalties", abbr: "10Pen", description: "Winner of the first 10 penalties"};
   } else if (period === 30 && sport === 33){ //tennis
      return {Longname: "Games", Shortname: "Games", abbr: "Games", description: "Games"};
   } else if (Math.floor(period/10) === 3 && sport === 33){ //tennis
      return {Longname: `Set ${period-30} Games`, Shortname: `Set ${period-30} Games`, abbr: `S${period-30}G`, description: `Set ${period-30} Games`};
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
}, playerName?: string, home?: string, away?: string): string {
   const market = decodeMkt(selection.mkt, home, away);
   const period = decodePeriod(selection.period, selection.sport);
   const player = playerName ? playerName : bytesToPlayer(selection.player);
   const side = selection.side ? market?.sides[0] : market?.sides[1];
   return `${player !== "" ? player + " - " : ""}${market?.name} - ${period?.abbr} - ${side} ${selection.is_live ? " (LIVE)" : ""}`;
}

