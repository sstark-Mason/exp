<script lang="ts">
    import { onMount } from 'svelte';
    import MCQ from './MultipleChoiceQuestion/MCQ.ts';
    import type { MultipleChoiceQuestionProps, MultipleChoiceQuestion, ChoiceOption } from './MultipleChoiceQuestion/types.d.ts';

    import debugLib from 'debug';
    const debug = debugLib('exp:MCQ');

    let { props: MCQprops, bindableComplete = $bindable(false), bindableScoreArray = $bindable([])}: {
        props: MultipleChoiceQuestionProps, bindableComplete: boolean, bindableScoreArray: number[]
    } = $props();
    
    // svelte-ignore state_referenced_locally
    const q: MultipleChoiceQuestion = $state(MCQ.new(MCQprops));
    const id = q.qid.split('_').join('-').toUpperCase();
    
    const trueResponses: ChoiceOption[] = $derived(q.responses.filter((r) => r.isTrue)); // Derived for reference safety (possible edge case?)
    const selectedResponses: ChoiceOption[] = $derived(q.responses.filter((r) => r.isSelected))
    const allCorrectAreSelected: boolean = $derived(trueResponses.every((r) => r.isSelected));
    const noIncorrectSelected: boolean = $derived(selectedResponses.every((r) => r.isTrue !== false));

    const questionIsComplete: boolean = $derived.by(() => {
        if (!q.required) { return true; }
        else if (!q.showFeedbackOnSelect) { return selectedResponses.length > 0; }
        else return allCorrectAreSelected && noIncorrectSelected;
    });

    $effect(() => {
        bindableComplete = questionIsComplete;
        switch (questionIsComplete) {
            case true:
                debug(`Question ${q.qid} completed.`);
                if (q.onComplete) { q.onComplete(); }
                if (q.exportScoreArray) { q.exportScoreArray(q.qid, scoreArray); }
                break;
            case false:
                break;
        }
    });
    
    
    const scoreArray: number[] = $derived(MCQ.exportScoreArray(q));
    $effect(() => {
        bindableScoreArray = scoreArray;
    });

    const possibleCorrect: number = q.responses.filter((r) => r.isTrue).length;
    const maxPoints: number = score(possibleCorrect, 0, q.responses.length);
    const numSelected: number = $derived(scoreArray.filter((s) => s !== 0).length);
    const numCorrect: number = $derived(scoreArray.filter((s) => s === 1).length);
    const numIncorrect: number = $derived(scoreArray.filter((s) => s === -1).length);
    
    const points: number = $derived(score(numCorrect, numIncorrect, q.responses.length));
    const possiblePoints: number = $derived(score(possibleCorrect, numIncorrect, q.responses.length));

    function score(correct: number, incorrect: number, total: number): number {
        if (possibleCorrect === 0) { return 0; }
        const score = round((1 - ((correct + incorrect) / total)), 2);
        return score;
    }

    function round(x: number, places: number) {
        const factor = Math.pow(10, places);
        return Math.round(x * factor) / factor;
    }

</script>

<div class="exp-question multiple-choice-question">

    <span class="question-text">
        <span class="question-id"
        class:completed={trueResponses.length > 0 && questionIsComplete && selectedResponses.length > 0}
        class:answered={trueResponses.length === 0 && selectedResponses.length > 0}
        class:partial={!questionIsComplete && selectedResponses.length > 0 && trueResponses.length > 0}
        >{id}</span>
        {@html MCQ.render(q.questionText)}
    </span>

    {#if q.showScore && possibleCorrect > 0}
        <div class="score-display">
             Points: {@html allCorrectAreSelected ? `<strong>${points}</strong>` : `<strong>${possiblePoints}</strong> possible`}
        </div>
    {/if}
    
    {#if q.allowReset}
        <button class="reset-button" onclick={() => { MCQ.reset(q); }}>Reset</button>
    {/if}

    {#each q.responses as r (r.displayIndex)}
    {@const rid = `${q.qid}-${r.displayIndex}`}
        <div class="choice-option"
            class:correct={q.showFeedbackOnSelect && r.isTrue && r.isSelected}
            class:incorrect={q.showFeedbackOnSelect && !r.isTrue && r.wasEverSelected}
            class:disabled={(q.showFeedbackOnSelect && r.isTrue && r.isSelected)
            || (q.showFeedbackOnSelect && allCorrectAreSelected && !r.isSelected)
            || (q.showFeedbackOnSelect && !r.isTrue && r.wasEverSelected && !r.isSelected)}
        >
            <input id={rid} type={q.inputType} name={q.qid} value={r.text} checked={r.isSelected} onchange={(e) => { MCQ.selectionEvent(q, r.displayIndex, e.currentTarget) }}/>
            <label for={rid}>{@html MCQ.render(r.text)}</label>
        </div>
    {/each}

</div>

<style>

    :root {
        --color-default: oklch(0.80 0 0);
        --color-incomplete: oklch(0.85 0.2 100);
        --color-answered: oklch(0.80 0.5 240);
        --color-correct: oklch(0.80 0.5 170);
        --color-incorrect-selected: oklch(0.7 0.2 20 / 1);
        --color-incorrect-disabled: oklch(0.7 0.2 20 / 0.5);
    }

    .question-id {
        font-weight: bold;
        margin-right: 8px;
        background-color: var(--color-default);
        padding: 2px 6px;
        border-radius: 4px;
        /* transition: 0.2s ease-in; */
        &.answered {
            background-color: var(--color-answered);
        }
        &.partial {
            background-color: var(--color-incomplete);
            
        }
        &.completed {
            background-color: var(--color-correct);
            opacity: 0.6;
        }
    }

    .multiple-choice-question {
        display: flex;
        flex-direction: column;
    }

    .question-text {
        font-size: 1.2em;
        margin-bottom: 8px;
    }

    .reset-button {
        align-self: flex-start;
        margin: 8px 0px;
    }

    .choice-option {
        display: block;
        width: fit-content;
        box-sizing: border-box;

        font-size: 1.1em;

        padding-left: 4px;
        padding-right: 8px;
        margin-top: 2px;
        margin-bottom: 2px;
        
        border-width: 1px;
        border-style: solid;
        border-color: transparent;
        border-radius: 4px;

        user-select: none;

        cursor: pointer;
        & > * {
            cursor: pointer;
        }

        &:hover {
            background-color: lightgrey;
        }

        &.correct {
            background-color: var(--color-correct);
            opacity: 1.0;
        }

        &.incorrect {
            background-color: var(--color-incorrect-selected);
            &:hover {
                background-color: var(--color-incorrect-disabled);
            }
            &.disabled {
                background-color: var(--color-incorrect-disabled);
            }
        }

        &.disabled {
            pointer-events: none;
        }

        &.disabled:not(.correct) {
            opacity: 0.5;
        }
    }

    .reset-button {
        cursor: pointer;
    }
    
</style>