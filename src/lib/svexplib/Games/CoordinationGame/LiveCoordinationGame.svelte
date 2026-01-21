<script lang="ts">
    import debugLib from "debug";
    const debug = debugLib("exp:liveCoordinationGame");
    import CoordinationGameFrame from '$svexplib/Games/CoordinationGame/CoordinationGameFrame.svelte';
    import * as ccg from "$svexplib/Games/CoordinationGame/CoordinationGameBase.ts";
    import { PersistedState } from "runed";
    import { goto } from "$app/navigation";

    let { player1Name = "fem1", choiceSet = ccg.choiceSetColorsUnicode, maxRounds = 48, onGameEnd }: { 
        player1Name?: string,
        choiceSet?: string[],
        maxRounds?: number,
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
            idx: roundCount.current,
            created_at_time: new Date().toISOString(),
            player_1_avatar: player1Name,
            player_2_avatar: currentGamePermutation ? currentGamePermutation[1] : "unknown",
            choice_option_1: currentGamePermutation ? currentGamePermutation[2] : "unknown",
            choice_option_2: currentGamePermutation ? currentGamePermutation[3] : "unknown",
            choice_payoff_1: 2,
            choice_payoff_2: 1,
            player_1_chose: choice,
        }
        ccg.saveGameRoundToHistory(round);
        if (roundCount.current >= maxRounds) {
            debug("Max rounds reached. Ending game.");
            endGame();
            return;
        }
        currentGamePermutation = nextGamePermutation();
    }

</script>

{#if currentGamePermutation && roundCount.current < maxRounds}
<CoordinationGameFrame
    player1Avatar={ccg.avatarMap[currentGamePermutation[0]]}
    player2Avatar={ccg.avatarMap[currentGamePermutation[1]]}
    choiceOption1={currentGamePermutation[2]}
    choiceOption2={currentGamePermutation[3]}
    outcomeC1C1={[2, 1] as [number, number]}
    outcomeC1C2={[0, 0] as [number, number]}
    outcomeC2C1={[0, 0] as [number, number]}
    outcomeC2C2={[1, 2] as [number, number]}
    onChoiceSelection={onChoiceSelection}
/>
{/if}