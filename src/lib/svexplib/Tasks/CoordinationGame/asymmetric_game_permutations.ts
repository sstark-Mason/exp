// 6 choice combinations
// * 2 payoff permutations per choice combination
// = 12 choice/payoff setups per opponent type

enum PlayerType { Male, Female, None }
enum ChoiceValue { Blue, Pink, Green, Yellow } 

interface GameSetup {
    players: [PlayerType, PlayerType];
    choices: [ChoiceValue, ChoiceValue];
    outcomes: GameOutcome;
}

interface Payoffs {
    Uncoordinated: number;
    CoordinatedLow: number;
    CoordinatedHigh: number;
}

interface DestructuredGame {
    player1Type: PlayerType;
    player2Type: PlayerType;
    choice1Value: ChoiceValue;
    choice2Value: ChoiceValue;
    outcome_C1C1: [number, number];
    outcome_C2C2: [number, number];
    outcome_C1C2: [number, number];
    outcome_C2C1: [number, number];
}

type GameOutcome = Map<[ChoiceValue, ChoiceValue], [number, number]>;

export function GenerateAsymmetricGameSetups_1(payoffs: Payoffs): Set<GameSetup> {
    const setups = new Set<GameSetup>();

    for (const p1 of Object.values(PlayerType).filter(v => typeof v === 'number') as PlayerType[]) {
        for (const p2 of Object.values(PlayerType).filter(v => typeof v === 'number') as PlayerType[]) {
            for (let i = 0; i < Object.values(ChoiceValue).length; i++) {
                for (let j = 0; j < Object.values(ChoiceValue).length; j++) {
                    if (i === j) continue;
                    const c1 = Object.values(ChoiceValue).filter(v => typeof v === 'number')[i] as ChoiceValue;
                    if (c1 === undefined) continue;
                    const c2 = Object.values(ChoiceValue).filter(v => typeof v === 'number')[j] as ChoiceValue;
                    if (c2 === undefined) continue;

                    const outcomes_1: GameOutcome = new Map();
                    outcomes_1.set([c1, c1], [payoffs.CoordinatedHigh, payoffs.CoordinatedLow]);
                    outcomes_1.set([c2, c2], [payoffs.CoordinatedLow, payoffs.CoordinatedHigh]);
                    outcomes_1.set([c1, c2], [payoffs.Uncoordinated, payoffs.Uncoordinated]);
                    outcomes_1.set([c2, c1], [payoffs.Uncoordinated, payoffs.Uncoordinated]);
                    const setup_1: GameSetup = {
                        players: [p1, p2],
                        choices: [c1, c2],
                        outcomes: outcomes_1
                    };
                    setups.add(setup_1);

                    const outcomes_2: GameOutcome = new Map();
                    outcomes_2.set([c1, c1], [payoffs.CoordinatedLow, payoffs.CoordinatedHigh]);
                    outcomes_2.set([c2, c2], [payoffs.CoordinatedHigh, payoffs.CoordinatedLow]);
                    outcomes_2.set([c1, c2], [payoffs.Uncoordinated, payoffs.Uncoordinated]);
                    outcomes_2.set([c2, c1], [payoffs.Uncoordinated, payoffs.Uncoordinated]);
                    const setup_2: GameSetup = {
                        players: [p1, p2],
                        choices: [c1, c2],
                        outcomes: outcomes_2
                    };
                    setups.add(setup_2);
                }
            }
        }
    }

    return setups;
}

export function GenerateAsymmetricGameSetups_2(payoffs: Payoffs): Set<GameSetup> {
    const setups = new Set<GameSetup>();
    
    for (const p1 of Object.values(PlayerType).filter(v => typeof v === 'number') as PlayerType[]) {
        for (const p2 of Object.values(PlayerType).filter(v => typeof v === 'number') as PlayerType[]) {
            for (let i = 0; i < Object.values(ChoiceValue).length; i++) {
                for (let j = i; j < Object.values(ChoiceValue).length; j++) {
                    if (i === j) continue;
                    const c1 = Object.values(ChoiceValue).filter(v => typeof v === 'number')[i] as ChoiceValue;
                    if (c1 === undefined) continue;
                    const c2 = Object.values(ChoiceValue).filter(v => typeof v === 'number')[j] as ChoiceValue;
                    if (c2 === undefined) continue;
                    const outcomes: GameOutcome = new Map();
                    outcomes.set([c1, c1], [payoffs.CoordinatedHigh, payoffs.CoordinatedLow]);
                    outcomes.set([c2, c2], [payoffs.CoordinatedLow, payoffs.CoordinatedHigh]);
                    outcomes.set([c1, c2], [payoffs.Uncoordinated, payoffs.Uncoordinated]);
                    outcomes.set([c2, c1], [payoffs.Uncoordinated, payoffs.Uncoordinated]);
                    const setup: GameSetup = {
                        players: [p1, p2],
                        choices: [c1, c2],
                        outcomes: outcomes
                    };
                    setups.add(setup);
                }
            }
        }
    }

    return setups;
}

function GenerateDestructuredGames(payoffs: Payoffs): Set<DestructuredGame>{
    const games = new Set<DestructuredGame>();
    for (const p1 of Object.values(PlayerType).filter(v => typeof v === 'number') as PlayerType[]) {
        for (const p2 of Object.values(PlayerType).filter(v => typeof v === 'number') as PlayerType[]) {
            for (let i = 0; i < Object.values(ChoiceValue).length; i++) {
                for (let j = 0; j < Object.values(ChoiceValue).length; j++) {
                    if (i === j) continue;
                    const c1 = Object.values(ChoiceValue).filter(v => typeof v === 'number')[i] as ChoiceValue;
                    if (c1 === undefined) continue;
                    const c2 = Object.values(ChoiceValue).filter(v => typeof v === 'number')[j] as ChoiceValue;
                    if (c2 === undefined) continue;
                    const game: DestructuredGame = {
                        player1Type: p1,
                        player2Type: p2,
                        choice1Value: c1,
                        choice2Value: c2,
                        outcome_C1C1: [payoffs.CoordinatedHigh, payoffs.CoordinatedLow],
                        outcome_C2C2: [payoffs.CoordinatedLow, payoffs.CoordinatedHigh],
                        outcome_C1C2: [payoffs.Uncoordinated, payoffs.Uncoordinated],
                        outcome_C2C1: [payoffs.Uncoordinated, payoffs.Uncoordinated],
                    };
                    games.add(game);
                }
            }
        }
    }

    return games;
}



function WriteGameSetupsToCSV(filename: string, setups: Set<GameSetup>) {
    const fs = require('fs');
    const columns = [
        'Player1Type',
        'Player2Type',
        'Choice1Value',
        'Choice2Value',
        'Outcome_C1C1',
        'Outcome_C2C2',
        'Outcome_C1C2',
        'Outcome_C2C1',
    ]
    const rows = Array.from(setups).map(setup => {
        const outcome_C1C1 = setup.outcomes.get([setup.choices[0], setup.choices[0]]);
        const outcome_C2C2 = setup.outcomes.get([setup.choices[1], setup.choices[1]]);
        const outcome_C1C2 = setup.outcomes.get([setup.choices[0], setup.choices[1]]);
        const outcome_C2C1 = setup.outcomes.get([setup.choices[1], setup.choices[0]]);
        return {
            Player1Type: PlayerType[setup.players[0]],
            Player2Type: PlayerType[setup.players[1]],
            Choice1Value: ChoiceValue[setup.choices[0]],
            Choice2Value: ChoiceValue[setup.choices[1]],
            Outcome_C1C1: outcome_C1C1 ? `${outcome_C1C1[0]}-${outcome_C1C1[1]}` : '',
            Outcome_C2C2: outcome_C2C2 ? `${outcome_C2C2[0]}-${outcome_C2C2[1]}` : '',
            Outcome_C1C2: outcome_C1C2 ? `${outcome_C1C2[0]}-${outcome_C1C2[1]}` : '',
            Outcome_C2C1: outcome_C2C1 ? `${outcome_C2C1[0]}-${outcome_C2C1[1]}` : '',
        };
    });
    const csvContent = [
        columns.join(','),
        ...rows.map(row => columns.map(col => row[col as keyof typeof row]).join(','))
    ].join('\n');
    fs.writeFileSync(filename, csvContent);
}

function WriteDestructuredGamesToCSV(filename: string, seperator: string, games: Set<DestructuredGame>) {
    const fs = require('fs');
    const columns = [
        'Player1Type',
        'Player2Type',
        'Choice1Value',
        'Choice2Value',
        'Outcome_C1C1',
        'Outcome_C2C2',
        'Outcome_C1C2',
        'Outcome_C2C1',
    ]
    const rows = Array.from(games).map(game => {
        return {
            Player1Type: PlayerType[game.player1Type],
            Player2Type: PlayerType[game.player2Type],
            Choice1Value: ChoiceValue[game.choice1Value],
            Choice2Value: ChoiceValue[game.choice2Value],
            Outcome_C1C1: `(${game.outcome_C1C1[0]}, ${game.outcome_C1C1[1]})`,
            Outcome_C2C2: `(${game.outcome_C2C2[0]}, ${game.outcome_C2C2[1]})`,
            Outcome_C1C2: `(${game.outcome_C1C2[0]}, ${game.outcome_C1C2[1]})`,
            Outcome_C2C1: `(${game.outcome_C2C1[0]}, ${game.outcome_C2C1[1]})`,
        };
    });
    const csvContent = [
        columns.join(seperator),
        ...rows.map(row => columns.map(col => row[col as keyof typeof row]).join(seperator))
    ].join('\n');
    fs.writeFileSync(filename, csvContent);
}


const payoffs = {
    Uncoordinated: 0,
    CoordinatedLow: 1,
    CoordinatedHigh: 2
};

const setups_1 = GenerateAsymmetricGameSetups_1(payoffs);
console.log(`Total asymmetric game setups (method 1) generated: ${setups_1.size}`);
WriteGameSetupsToCSV("asymmetric_game_setups_1.csv", setups_1);

const setups_2 = GenerateAsymmetricGameSetups_2(payoffs);
console.log(`Total asymmetric game setups (method 2) generated: ${setups_2.size}`);
WriteGameSetupsToCSV("asymmetric_game_setups_2.csv", setups_2);

const destructuredGames = GenerateDestructuredGames(payoffs);
console.log(`Total destructured asymmetric games generated: ${destructuredGames.size}`);
WriteDestructuredGamesToCSV("destructured_asymmetric_games.tsv", '\t', destructuredGames);