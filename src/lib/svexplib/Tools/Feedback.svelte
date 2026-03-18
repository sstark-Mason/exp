<script lang="ts">

    import { PersistedState } from 'runed';
    import SliderQuestion from '$lib/svexplib/Questions/SliderQuestion.svelte';

    interface FeedbackProps {
        target_id: string;
        onClose: (feedbackData: FeedbackData) => void;
    }

    export interface FeedbackData {
        target_id: string;
        comments: string;
        metrics: {
            clarity: number | null;
            verbosity: number | null;
            appropriateness: number | null;
        }
    }

    let { target_id, onClose }: { target_id: string, onClose: (feedbackData: FeedbackData) => void } = $props();

    // svelte-ignore state_referenced_locally
        let feedbackData = new PersistedState<any>(`feedback-${target_id}`, {
        target_id: target_id,
        comments: '',
        metrics: {
            clarity: null,
            verbosity: null,
            appropriateness: null
        }
    });
    
    let showFeedback = $state(false);

    function toggleFeedback() {
        showFeedback = !showFeedback;
        if (!showFeedback) {
            closeAndSubmit();
        }
    }

    function isThereFeedback() {
        return feedbackData.current.comments || Object.values(feedbackData.current.metrics).some(metric => metric !== null);
    }

    function handleClickOutside(event: MouseEvent) {
        if (dialogElement) {
            const rect = dialogElement.getBoundingClientRect();
            const isInDialog = (
                rect.top <= event.clientY &&
                event.clientY <= rect.top + rect.height &&
                rect.left <= event.clientX &&
                event.clientX <= rect.left + rect.width
            );
            if (!isInDialog) {
                closeAndSubmit();
            }
        }
    }

    function closeAndSubmit() {
        showFeedback = false;
        if (isThereFeedback()) {
            onClose(feedbackData.current);
        }
    }
    

    let dialogElement: HTMLDialogElement;

    $effect(() => {
        if (showFeedback) {
            dialogElement?.showModal();
        } else {
            dialogElement?.close();
        }
    })

</script>

<p></p>

<button class="feedback-toggle" onclick={toggleFeedback}>
    {#if !feedbackData.current.comments}
        <span style="transform: scaleX(1);">🗨️</span>
    {:else}
        <span style="display: inline-block; transform: scaleX(-1);">💬</span>
    {/if}
</button>

<dialog
    bind:this={dialogElement}
    oncancel={closeAndSubmit}
    onmousedown={handleClickOutside}
    class="feedback-dialog"
>
    <b>Ratings for <em>{target_id}</em></b>:

    <div class="feedback-slider">
        <SliderQuestion
            bind:bindableValue={feedbackData.current.metrics.clarity}
            props={{
                qid: 'feedback_welcome_clarity',
                questionText: "Clarity",
                range: [0, 5],
                rangeLabels: ['', ''],
                step: 0.5,
                tickInterval: 1,
                required: true
            }}
        />
    </div>

    <div class="feedback-slider">
        <SliderQuestion
            bind:bindableValue={feedbackData.current.metrics.verbosity}
            props={{
                qid: 'feedback_welcome_verbosity',
                questionText: "Verbosity",
                range: [0, 5],
                rangeLabels: ['', ''],
                step: 0.5,
                tickInterval: 1,
                required: true
            }}
        />
    </div>

    <div class="feedback-slider">
        <SliderQuestion
            bind:bindableValue={feedbackData.current.metrics.appropriateness}
            props={{
                qid: 'feedback_welcome_appropriateness',
                questionText: "Appropriateness",
                range: [0, 5],
                rangeLabels: ['', ''],
                step: 0.5,
                tickInterval: 1,
                required: true
            }}
        />
    </div>

    <b>Comments on <em>{target_id}</em></b>:

    <textarea
        bind:value={feedbackData.current.comments}
        placeholder="Enter feedback here"
        rows="5"
        cols="30">
    </textarea>

    <button onclick={toggleFeedback}>Close</button>

</dialog>

<style>
    .feedback-toggle {
        border: none;
        background: none;
        /* position: fixed; */
        /* top: 1rem; */
        /* right: 1rem; */
        position: absolute;
        bottom: 0.5rem;
        right: 0.5rem;
        cursor: pointer;
        padding: 0.25rem;
        z-index: 10;
    }

    .feedback-dialog {
        border: 1px solid #ccc;
        border-radius: 5px;
        padding: 1rem;
        width: 300px;
    }

    textarea {
        width: 100%;
        margin-top: 1rem;
        font-family: inherit;
    }

    .feedback-slider {
        margin: 1rem 0;
        transform: scale(0.9);
    }
</style>