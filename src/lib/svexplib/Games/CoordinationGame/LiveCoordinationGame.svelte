<script lang="ts">
    import debugLib from "debug";
    const debug = debugLib("exp:liveCoordinationGame");
    import CoordinationGameFrame from '$svexplib/Games/CoordinationGame/CoordinationGameFrame.svelte';
    import * as ccg from "$svexplib/Games/CoordinationGame/CoordinationGameBase.ts";
    import { PersistedState } from "runed";
    import { goto } from "$app/navigation";

    let { player1Name, choiceSet, maxRounds, outcome_c1c1, outcome_c2c2, outcome_c1c2, outcome_c2c1, onGameEnd }: { 
        player1Name: string,
        choiceSet: string[],
        maxRounds?: number,
        outcome_c1c1: [number, number],
        outcome_c2c2: [number, number],
        outcome_c1c2: [number, number],
        outcome_c2c1: [number, number],
        onGameEnd?: () => void
    } = $props();

    let permutations = ccg.newPermutations(player1Name, choiceSet);
    let currentGamePermutation: string[] | null = $state(nextGamePermutation());
    const roundCount = new PersistedState("ccg-round-count", 0);

    function nextGamePermutation(): string[] | null {
        const nextPermutation = ccg.popRandomPermutation(permutations);
        if (nextPermutation) {
            debug("Next permutation:", nextPermutation);
            return nextPermutation;
        } else {
            return onNullPermutation();
        }
    }

    function onNullPermutation(): string[] | null {
        debug("No more permutations left; getting new permutations.");
        // permutations = ccg.newPermutations(player1Name, choiceSet);
        // return nextGamePermutation();
        endGame();
        return null;
    }

    async function endGame() {
        debug("Game ended by reaching max rounds.");
        currentGamePermutation = null;
        permutations = [];
        await ccg.pushGameRoundHistoryToDB();
        onGameEnd?.();
    }

    function onChoiceSelection(choice: string) {
        debug("Player selected choice:", choice);
        roundCount.current++;
        debug("Games played so far:", roundCount.current);
        const round: ccg.CoordinationGameRound = {
            created_at_time: new Date().toISOString(),
            round_number: roundCount.current,
            player_1_avatar: player1Name,
            player_2_avatar: currentGamePermutation ? currentGamePermutation[1] : "unknown",
            choice_option_1: currentGamePermutation ? currentGamePermutation[2] : "unknown",
            choice_option_2: currentGamePermutation ? currentGamePermutation[3] : "unknown",
            outcome_c1c1: outcome_c1c1,
            outcome_c2c2: outcome_c2c2,
            outcome_c1c2: outcome_c1c2,
            outcome_c2c1: outcome_c2c1,
            player_1_chose: choice,
        }
        ccg.saveGameRoundToHistory(round);
        if (maxRounds && roundCount.current >= maxRounds) {
            debug("Max rounds reached. Ending game.");
            endGame();
            return;
        }
        currentGamePermutation = nextGamePermutation();
    }

</script>

{#if currentGamePermutation && (!maxRounds || roundCount.current < maxRounds)}
<CoordinationGameFrame
    player_1_avatar={ccg.avatarMap[currentGamePermutation[0]]}
    player_2_avatar={ccg.avatarMap[currentGamePermutation[1]]}
    choice_option_1={currentGamePermutation[2]}
    choice_option_2={currentGamePermutation[3]}
    outcome_c1c1={outcome_c1c1}
    outcome_c1c2={outcome_c1c2}
    outcome_c2c1={outcome_c2c1}
    outcome_c2c2={outcome_c2c2}
    onChoiceSelection={onChoiceSelection}
/>
{/if}