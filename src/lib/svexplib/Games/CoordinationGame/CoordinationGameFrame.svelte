<script lang="ts">
    import debugLib from "debug";
    const debug = debugLib("exp:ccgFrame");

    let { player1Avatar, player2Avatar, choiceOption1, choiceOption2, outcomeC1C1, outcomeC1C2, outcomeC2C1, outcomeC2C2 }: {
        player1Avatar: string;
        player2Avatar: string;
        choiceOption1: string;
        choiceOption2: string;
        outcomeC1C1: [number, number];
        outcomeC1C2: [number, number];
        outcomeC2C1: [number, number];
        outcomeC2C2: [number, number];
    } = $props();

    
</script>
