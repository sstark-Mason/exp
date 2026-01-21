<script lang="ts">
    import debugLib from "debug";
    const debug = debugLib("exp:PracticeCoordinationGame");
    import CoordinationGameFrame from "$svexplib/Games/CoordinationGame/CoordinationGameFrame.svelte";
    import * as ccg from "$svexplib/Games/CoordinationGame/CoordinationGameBase.ts";

    let { player1Name = "fem1", choiceSet = ccg.choiceSetColorsUnicode }: { 
        player1Name?: string,
        choiceSet?: string[],
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
