type PlayerPropDetails = {
   mktStartingValue: number,
   prettyName: string,
   sports: string[],
   inUse: boolean,
   details?: string | null
}

const playerProps: PlayerPropDetails[] = [
   // General
   { mktStartingValue: 11000, prettyName: "Points", sports: ["basketball", "hockey"], inUse: true, details: "Points by a player" },
   { mktStartingValue: 11500, prettyName: "Goals", sports: ["hockey", "soccer"], inUse: true },
   { mktStartingValue: 12000, prettyName: "Assists", sports: ["basketball", "hockey", "soccer"], inUse: true, details: "Assists by a player" },
   { mktStartingValue: 12500, prettyName: "Saves", sports: ["hockey", "soccer"], inUse: true, details: "Saves by a player" },
   
   //Esports
   { mktStartingValue: 15000, prettyName: "Kills", sports: ["esports"], inUse: false },
   { mktStartingValue: 15500, prettyName: "Headshots", sports: ["esports"], inUse: false },
   { mktStartingValue: 16000, prettyName: "Deaths", sports: ["esports"], inUse: false },

   // Baseball
   { mktStartingValue: 20000, prettyName: "Home Runs", sports: ["baseball"], inUse: true },
   { mktStartingValue: 20500, prettyName: "Strikeouts", sports: ["baseball"], inUse: true, details: "Strikeouts by a pitcher" },
   { mktStartingValue: 21000, prettyName: "Total Bases", sports: ["baseball"], inUse: true },
   { mktStartingValue: 21500, prettyName: "Pitching Outs", sports: ["baseball"], inUse: true, details: "Total outs by a pitcher" },

   // Basketball
   { mktStartingValue: 30000, prettyName: "Rebounds", sports: ["basketball"], inUse: true, details: "Rebounds by a player" },
   { mktStartingValue: 30500, prettyName: "Steals", sports: ["basketball"], inUse: false },
   { mktStartingValue: 31000, prettyName: "Turnovers", sports: ["basketball"], inUse: false },
   { mktStartingValue: 31500, prettyName: "Blocks", sports: ["basketball"], inUse: false },
   { mktStartingValue: 32000, prettyName: "Three Point Made", sports: ["basketball"], inUse: true, details: "Three point field goals made by a player" },
   { mktStartingValue: 32500, prettyName: "Double Double", sports: ["basketball"], inUse: true, details: "Double double by a player" },
   { mktStartingValue: 33000, prettyName: "Triple Double", sports: ["basketball"], inUse: false },
   { mktStartingValue: 33500, prettyName: "Points+Assists", sports: ["basketball"], inUse: false },
   { mktStartingValue: 34000, prettyName: "Points+Rebounds", sports: ["basketball"], inUse: false },
   { mktStartingValue: 34500, prettyName: "Assists+Rebounds", sports: ["basketball"], inUse: false },
   { mktStartingValue: 35000, prettyName: "Points+Rebounds+Assist", sports: ["basketball"], inUse: true, details: "Points + Rebounds + Assists by a player" },
   
   // American Football
   { mktStartingValue: 40000, prettyName: "Touchdowns", sports: ["football"], inUse: true },
   { mktStartingValue: 40500, prettyName: "Field Goals", sports: ["football"], inUse: false },
   { mktStartingValue: 41000, prettyName: "Rushing Yards", sports: ["football"], inUse: true },
   { mktStartingValue: 41500, prettyName: "Rushing Attempts", sports: ["football"], inUse: true },
   { mktStartingValue: 42000, prettyName: "Passing Yards", sports: ["football"], inUse: true },
   //use 42500 also for passing yards because passing yards can be more than 250 yards
   { mktStartingValue: 42500, prettyName: "Passing Yards", sports: ["football"], inUse: true },
   { mktStartingValue: 43000, prettyName: "Receiving Yards", sports: ["football"], inUse: true },
   { mktStartingValue: 43500, prettyName: "Rush Attempts", sports: ["football"], inUse: true },
   { mktStartingValue: 44000, prettyName: "Pass Attempts", sports: ["football"], inUse: true },
   { mktStartingValue: 44500, prettyName: "FG Attempts", sports: ["football"], inUse: false },
   { mktStartingValue: 45000, prettyName: "Rushes", sports: ["football"], inUse: false },
   { mktStartingValue: 45500, prettyName: "Receptions", sports: ["football"], inUse: true },
   { mktStartingValue: 46000, prettyName: "Pass Completions", sports: ["football"], inUse: true },
   { mktStartingValue: 46500, prettyName: "Ints", sports: ["football"], inUse: false },
   { mktStartingValue: 47000, prettyName: "Ints Thrown", sports: ["football"], inUse: false },
   { mktStartingValue: 47500, prettyName: "Passing Touchdowns", sports: ["football"], inUse: true, details: "Passes that result in a touchdown by a QB" },
   
   // Ice Hockey
   { mktStartingValue: 50000, prettyName: "Shots On Goal", sports: ["hockey"], inUse: true, details: "Shots on goal by a player" },
   { mktStartingValue: 50500, prettyName: "PP Points", sports: ["hockey"], inUse: false },
   { mktStartingValue: 51000, prettyName: "Blocked Shots", sports: ["hockey"], inUse: false },
   
   // Soccer
   { mktStartingValue: 52000, prettyName: "First Goal Scorer", sports: ["soccer"], inUse: false },
   { mktStartingValue: 52500, prettyName: "Yellow Card", sports: ["soccer"], inUse: false },
   { mktStartingValue: 53000, prettyName: "Goals+Assists", sports: ["soccer"], inUse: false },
   { mktStartingValue: 53500, prettyName: "Red Card", sports: ["soccer"], inUse: false },
   { mktStartingValue: 54000, prettyName: "Shots", sports: ["hockey", "soccer"], inUse: false },
   { mktStartingValue: 54500, prettyName: "Shots On Target", sports: ["soccer"], inUse: false },
   { mktStartingValue: 55000, prettyName: "Fouls", sports: ["soccer"], inUse: false },
   { mktStartingValue: 55500, prettyName: "Tackles", sports: ["soccer"], inUse: false },
   { mktStartingValue: 56000, prettyName: "Passes", sports: ["soccer"], inUse: false },
]

export const propsByMktValue = new Map<number, PlayerPropDetails>();

playerProps.forEach(prop => {
   propsByMktValue.set(prop.mktStartingValue, prop);
});

export { playerProps };
export type { PlayerPropDetails };