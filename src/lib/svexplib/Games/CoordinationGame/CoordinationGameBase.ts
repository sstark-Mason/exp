import debugLib from "debug";
const debug = debugLib("CoordinationGameBase");
import { PersistedState } from "runed";
import { getSupabase, newDbKey } from "$lib/db/db_ccg_client";

import fem1 from "./Portraits/blurred/fem1.webp";
import fem2 from "./Portraits/blurred/fem2.webp";
import masc1 from "./Portraits/blurred/masc1.webp";
import masc2 from "./Portraits/blurred/masc2.webp";

export const avatarMap: Record<string, string> = {
    fem1: fem1,
    fem2: fem2,
    masc1: masc1,
    masc2: masc2,
};

export const choiceSetSymbols = ["♂", "♀", "♃", "♅"];
export const choiceSetColorsUnicode = ["🟦", "🟥", "🟩", "🟨"];

export function newPermutations(player1Avatar: string, choiceSet: string[]): string[][] {
    const permutations: string[][] = [];
    for (const player2Avatar of Object.keys(avatarMap)) {
        for (const choice1 of choiceSet) {
            for (const choice2 of choiceSet) {
                if (choice1 !== choice2) {
                    permutations.push([player1Avatar, player2Avatar, choice1, choice2]);
                }
            }
        }
    }
    return permutations;
}

export function popRandomPermutation(permutations: string[][]): string[] | null {
    if (permutations.length === 0) {
        debug("No more permutations left to pop.");
        return null;
    }
    const randomIndex = Math.floor(Math.random() * permutations.length);
    const permutation = permutations.splice(randomIndex, 1)[0];
    debug(`Popped permutation: ${permutation}`);
    return permutation;
}

export interface CoordinationGameRound {
    idx: number,
    created_at_time?: string,
    completed_at_time?: string,
    player_1_uid?: string,
    player_1_avatar: string,
    player_2_avatar: string,
    choice_option_1: string,
    choice_option_2: string,
    choice_payoff_1: number,
    choice_payoff_2: number,
    player_1_chose: string,
    player_2_chose?: string,
    player_1_payoff?: number,
    matched_rid?: number,
}

export function saveGameRoundToHistory(round: CoordinationGameRound) {
    const gameRoundHistory = new PersistedState<CoordinationGameRound[]>("coordinationGameRoundHistory", []);
    gameRoundHistory.current.push(round);
    debug(`Saved game round to history. Total rounds in history: ${gameRoundHistory.current.length}`);
}

export function clearGameRoundHistory() {
    const gameRoundHistory = new PersistedState<CoordinationGameRound[]>("coordinationGameRoundHistory", []);
    gameRoundHistory.current = [];
    debug("Cleared game round history.");
}

export async function pushGameRoundHistoryToDB() {
    const supabase = getSupabase();
    let sb_session = await supabase.auth.getSession();
    if (!sb_session.data.session) {
        debug("No active Supabase session; signing in anonymously.");
        const db_uid = await newDbKey("no-active-session-for-ccg");
        if (!db_uid) {
            debug("Failed to get a database key.");
            return;
        }
    }

    const gameRoundHistory = new PersistedState<CoordinationGameRound[]>("coordinationGameRoundHistory", []);
    debug(`Pushing ${gameRoundHistory.current.length} game rounds to DB...`);

    const rowsToInsert = gameRoundHistory.current.map((round) => ({
        created_at_time: round.created_at_time,
        player_1_avatar: round.player_1_avatar,
        player_2_avatar: round.player_2_avatar,
        choice_option_1: round.choice_option_1,
        choice_option_2: round.choice_option_2,
        choice_payoff_1: round.choice_payoff_1,
        choice_payoff_2: round.choice_payoff_2,
        player_1_chose: round.player_1_chose,
    }));

    const { error: insertError } = await supabase
        .from('game_rounds')
        .insert(rowsToInsert);

    if (insertError) {
        debug('Error inserting game round history to DB:', insertError);
        return;
    }

    // Clear history to prevent double-pushing
    gameRoundHistory.current = [];
    debug("Cleared game round history after pushing to DB.");
}