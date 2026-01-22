<script lang="ts">
    import debugLib from "debug";
    const debug = debugLib("exp:PracticeCoordinationGame");
    import CoordinationGameFrame from "$svexplib/Games/CoordinationGame/CoordinationGameFrame.svelte";
    import * as ccg from "$svexplib/Games/CoordinationGame/CoordinationGameBase.ts";

    let { player1Name, choiceSet, outcome_c1c1, outcome_c2c2, outcome_c1c2, outcome_c2c1 }: { 
        player1Name: string,
        choiceSet: string[],
        outcome_c1c1: [number, number],
        outcome_c2c2: [number, number],
        outcome_c1c2: [number, number],
        outcome_c2c1: [number, number],
    } = $props();

    let permutations = ccg.newPermutations(player1Name, choiceSet);
    let currentGamePermutation: string[] = $state(nextGamePermutation());

    function nextGamePermutation(): string[] {
        const nextPermutation = ccg.popRandomPermutation(permutations);
        if (nextPermutation) {
            debug("Next permutation:", nextPermutation);
            return nextPermutation;
        } else {
            debug("Renewing permutations.");
            permutations = ccg.newPermutations(player1Name, choiceSet);
            return nextGamePermutation();
        }
    }

    function onChoiceSelection(choice: string) {
        debug("Player selected choice in practice:", choice);
        currentGamePermutation = nextGamePermutation();
    }

</script>

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
