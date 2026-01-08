<script lang="ts">

    import { marked } from "marked";
    import { onMount } from "svelte";

    let { qText, choices, fmt }: {
        qText: string;
        choices: { text: string; isCorrect: boolean }[];
        fmt: "" | "markdown" | "html";
    } = $props();


</script>

{@html marked.parse(qText)}
<ul>
    {#each choices as choice, index}
        <li>
            {#if fmt === "markdown"}
                {@html marked.parse(choice.text)}
            {:else if fmt === "html"}
                {@html choice.text}
            {:else}
                {choice.text}
            {/if}
        </li>
    {/each}
</ul>

<br>