<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { ComprehensionQuestionManager } from "./ComprehensionQuestionManager.ts";

  import { PersistedState } from "runed";
  import debug from "debug";
  const log = debug("exp:ComprehensionQuestion");

  let { qid, text, reset, answers, continueButtonId }: {
    qid: string;
    text: string;
    reset?: boolean;
    answers: { text: string; isCorrect: boolean }[];
    continueButtonId?: string | null;
  } = $props();

  interface AnswerOption {
    cid: string;
    text: string;
    isCorrect: boolean;
    isSelected: boolean;
  }

  interface ComprehensionQuestion {
    qid: string;
    text: string;
    allowReset: boolean;
    answerOptions: AnswerOption[];
    isPassed: boolean;
    pageId: string;
    continueButtonId: string | null;
    manager?: ComprehensionQuestionManager | null;
  }

  let answerOptions: AnswerOption[] = answers.map((ans, index) => ({
    cid: `${qid}-${index + 1}`,
    text: ans.text,
    isCorrect: ans.isCorrect,
    isSelected: false,
  }));

  let question: ComprehensionQuestion = {
    qid,
    text,
    allowReset: reset || false,
    answerOptions,
    isPassed: false,
    pageId: getPageIdFromURL(),
    continueButtonId: continueButtonId || null,
    manager: null,
  };

  function getPageIdFromURL(): string {
    const url = new URL(window.location.href);
    return url.pathname;
  }

  let correctAnswers: string[] = answerOptions.filter((ans) =>
    ans.isCorrect
  ).map((ans) => ans.cid);
  // let selectedAnswers: string[] = $state([]);

  const _selectedAnswers = new PersistedState<string[]>(
    `${qid}-selected`,
    [],
  );
  let selectedAnswers: string[] = _selectedAnswers.current;

  const revealedAnswers = new PersistedState<string[]>(
    `${qid}-revealed`,
    [],
  );

  let answerLabelClasses = $state<Record<string, string[]>>({});
  for (const answer of answerOptions) {
    answerLabelClasses[answer.cid!] = [];
  }

  function checkBoxType(): "checkbox" | "radio" {
    const correctAnswersCount =
      question.answerOptions.filter((ans) => ans.isCorrect).length;
    return correctAnswersCount > 1 ? "checkbox" : "radio";
  }

  function answerClicked(cid: string) {
    const input = document.getElementById(cid) as HTMLInputElement;
    log("Answer clicked:", cid);
    log("Selected (checked): ", input.checked);

    revealedAnswers.current.push(cid);

    if (input.checked) {
      selectedAnswers.push(cid);
    } else {
      selectedAnswers = selectedAnswers.filter((id) => id !== cid);
    }
    _selectedAnswers.current = selectedAnswers;

    checkThisAnswer(cid);
    checkAllAnswers();
  }

  function checkThisAnswer(cid: string) {
    const input = document.getElementById(cid) as HTMLInputElement;
    const answer = question.answerOptions.find((ans) => ans.cid === cid);
    if (answer) {
      if (input.checked && answer.isCorrect) {
        input.disabled = true;
        answerLabelClasses[cid] = ["cq-choice-correct", "disabled"];
      } else if (input.checked && !answer.isCorrect) {
        answerLabelClasses[cid] = ["cq-choice-incorrect"];
        if (input.type === "radio") {
          input.disabled = true;
          answerLabelClasses[cid].push("disabled");
          selectedAnswers = [];
          _selectedAnswers.current = selectedAnswers;
        }
      } else if (!input.checked) {
        input.disabled = true;
        answerLabelClasses[cid].push("disabled");
      }
    }
  }

  function checkAllAnswers() {
    const onlyCorrectSelected =
      selectedAnswers.every((cid) => correctAnswers.includes(cid)) &&
      selectedAnswers.length === correctAnswers.length;
    if (onlyCorrectSelected) {
      log(`${question.qid}: all correct answers selected.`);
      question.isPassed = true;
      for (const ans of question.answerOptions) {
        const input = document.getElementById(ans.cid!) as HTMLInputElement;
        input.disabled = true;
        answerLabelClasses[ans.cid].push("disabled");
        question.manager?.updateQuestionStatus(hash, true);
      }
    } else {
      const allCorrectSelected = correctAnswers.every((cid) =>
        selectedAnswers.includes(cid)
      );
      if (allCorrectSelected) {
        for (const ans of question.answerOptions) {
          const input = document.getElementById(
            ans.cid!,
          ) as HTMLInputElement;
          if (!input.checked) {
            input.disabled = true;
            answerLabelClasses[ans.cid].push("disabled");
          }
        }
      }
    }
  }

  function resetQuestion() {
    selectedAnswers = [];
    _selectedAnswers.current = selectedAnswers;
    revealedAnswers.current = [];
    question.isPassed = false;
    for (const ans of question.answerOptions) {
      const input = document.getElementById(ans.cid) as HTMLInputElement;
      input.checked = false;
      input.disabled = false;
      ans.isSelected = false;
      answerLabelClasses[ans.cid] = [];
    }

    question.manager?.updateQuestionStatus(hash, false);
  }

  function shuffle<T>(arr: T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  
  function serializeQuestion(question: ComprehensionQuestion): string {
    return JSON.stringify({
      qid: question.qid,
      text: question.text,
      answerOptions: question.answerOptions.map((ans) => ({
        text: ans.text,
        isCorrect: ans.isCorrect,
      })),
    });
  }

  function hashString(str: string): string {
    let hash = 0;
    for (const char of str) {
      hash = (hash << 5) - hash + char.charCodeAt(0);
      hash |= 0;
    }
    return hash.toString();
  }

  const hash = hashString(serializeQuestion(question));

  question.answerOptions = shuffle(question.answerOptions);

  onMount(() => {
    question.manager = ComprehensionQuestionManager.getInstance(
      question.pageId,
      question.continueButtonId,
    );

    question.manager.registerQuestion(question.qid, hash);

    selectedAnswers = _selectedAnswers.current;
    for (const cid of revealedAnswers.current) {
      const input = document.getElementById(cid) as HTMLInputElement;
      const answer = answerOptions.find((ans) => ans.cid === cid);
      if (answer) {
        if (answer.isCorrect) {
          input.checked = true;
          input.disabled = true;
          answerLabelClasses[cid] = ["cq-choice-correct", "disabled"];
        } else {
          answerLabelClasses[cid] = ["cq-choice-incorrect"];
          if (selectedAnswers.includes(cid)) {
            input.checked = true;
          } else {
            input.disabled = true;
            answerLabelClasses[cid].push("disabled");
          }
        }
      }
    }
    checkAllAnswers();


  });

  onDestroy(() => {
    // Save final state with server
  });
</script>

<h3>{question.text}</h3>
{#if question.allowReset}
  <button
    onclick={() => {
      resetQuestion();
    }}
  >
    Reset
  </button><br>
{/if}

{#each question.answerOptions as answer}
  <span class="cq-input-wrapper">
    <input
      type={checkBoxType()}
      id={answer.cid}
      name={question.qid}
      value={answer.text}
      checked={answer.isSelected}
      onchange={(e) => answerClicked(answer.cid)}
    />
    {#if     answerLabelClasses[answer.cid] &&
      answerLabelClasses[answer.cid].includes("cq-choice-correct")}
      <span class="cq-icon-overlay correct">
        <!-- ✅ -->
         <svg width="100%" height="100%" viewBox="0 0 100 100">
          <g>
            <circle r="35" cx="50" cy="50" fill="forestgreen" stroke="black" stroke-width="1"/>
            <path
              d="M20,70 L40,90 L90,40 L40,90" stroke="black" stroke-width="12"
              transform="translate(55,30) scale(1) translate(-50,-50)"/>
          </g>
        </svg>
      </span>
    {/if}
    {#if     answerLabelClasses[answer.cid] &&
      answerLabelClasses[answer.cid].includes("cq-choice-incorrect") &&
      !answerLabelClasses[answer.cid].includes("disabled")}
      <span class="cq-icon-overlay incorrect">
        <!-- ❌ -->
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          <g>
            <circle r="35" cx="50" cy="50" fill="red" stroke="black" stroke-width="1"/>
            <path d="M20,10 L80,90" stroke="black" stroke-width="12" fill="none"/>
            <path d="M20,10 L80,90" stroke="black" stroke-width="12" fill="none" transform="translate(100,0) scale(-1,1)"/>
          </g>
        </svg>
      </span>
    {/if}
  </span>
  <label
    for={answer.cid}
    class="cq-choice {answerLabelClasses[answer.cid] ? answerLabelClasses[answer.cid].join(' ') : ''}"
  >
    {answer.text}
  </label><br>
{/each}
<br>

<style>
  :global([data-theme="light"]) {
    --choice-hover-bg: #d4e8fc; /* Unselected choice hover bg */
    --color-correct: #0b7f00;
    --color-correct-bg: #d4edda;
    --color-correct-text: #155724;
    --color-incorrect: #ff0000;
    --color-incorrect-bg: #f8d7da;
    --color-incorrect-hover: #f5c6cb;
    /* --color-correct-border: #28a745; */
    /* --color-incorrect-border: #dc3545; */
    --color-incorrect-text: #721c24;
  }

  :global([data-theme="dark"]) {
    --color-correct: #0b7f00; /* Lighter green for dark bg */
    --color-incorrect: #f87171; /* Lighter red for dark bg */
    --color-correct-bg: #007812; /* Dark gray bg for correct */
    --color-incorrect-hover: #4b5563; /* Even darker on hover */
    /* --color-correct-border: #4ade80; */
    --color-incorrect-bg: #7c0000;
    /* --color-incorrect-border: #8a1b1b; */
    --color-incorrect-text: #ffffff;
    --color-incorrect-hover: #b91c1c;
    --choice-hover-bg: #374151; /* Dark hover bg */

    /* button {
        background-color: #374151;
        color: #e5e7eb;
        border: 1px solid #6b7280;
    } */
  }

  :global([data-theme="dark"]) .cq-choice {
    color: #e5e7eb; /* Light text for labels in dark mode */
    border-color: #6b7280; /* Subtle border */
  }

  :global([data-theme="dark"]) h3 {
    color: #f9fafb; /* Light heading text */
  }

  :global([data-theme="dark"]) button:hover {
    background-color: #4b5563;
  }

  /* :root {
      --color-correct: #28a745;
      --color-incorrect: #dc3545;
      --color-correct-bg: #d4edda;
      --color-incorrect-bg: #f8d7da;
      --color-incorrect-hover: #f5c6cb;
      --color-correct-border: #28a745;
      --color-incorrect-border: #dc3545;
      --color-incorrect-text: #721c24;
      --choice-hover-bg: #d4e8fc;
  } */

  /* .color-blind {
      --color-correct: #0072B2;
      --color-incorrect: #E69F00;
      --color-correct-bg: #cce6ff;
      --color-incorrect-bg: #fff2cc;
      --color-incorrect-hover: #ffe599;
      --color-correct-border: #0072B2;
      --color-incorrect-border: #E69F00;
      --color-incorrect-text: #7f6000;
      --choice-hover-bg: #e0e0e0;
  } */

  .cq-choice {
    font-size: 1.1em;
    margin: 1px;
    padding: 2px;
    border-radius: 4px;
    display: inline-block;
    cursor: pointer;
  }
  .cq-choice:hover {
    background-color: var(--choice-hover-bg);
  }

  .cq-choice-correct.disabled {
    background-color: var(--color-correct-bg);
    border: 1px solid var(--color-correct-border);
    opacity: 1;
  }

  .cq-choice-incorrect:not(.disabled) {
    background-color: var(--color-incorrect-bg);
    border: 1px solid var(--color-incorrect-border);
    color: var(--color-incorrect-text);
  }
  .cq-choice-incorrect:not(.disabled):hover {
    background-color: var(--color-incorrect-hover);
  }
  .cq-choice-incorrect.disabled {
    opacity: 0.6;
    background-color: var(--color-incorrect-bg);
    border: 1px solid var(--color-incorrect-border);
    color: var(--color-incorrect-text);
  }

  .disabled {
    pointer-events: none;
    opacity: 0.6;
  }

  button {
    cursor: pointer;
    margin-top: 0px;
    margin-bottom: 6px;
  }

  h3 {
    margin-bottom: 0.3em; /* Adjust as needed, or set to 0 */
    padding-bottom: 0; /* In case padding is applied by a global style */
  }

  .cq-input-wrapper {
    position: relative;
    display: inline-block;
    width: 1.5em;
    height: 1.5em;
    vertical-align: middle;
    box-sizing: border-box;
  }

  .cq-input-wrapper:has(.cq-icon-overlay.correct) input,
  .cq-input-wrapper:has(.cq-icon-overlay.incorrect) input {
    opacity: 0;
  }

  .cq-icon-overlay {
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none; /* So clicks go to the input */
    z-index: 2;
    position: absolute;
    inset: 0;
    box-sizing: border-box;
    top: 0px;
    left: -5.5px;
  }
  .cq-icon-overlay.correct {
    color: var(--color-correct, green);
    position: absolute;
    width: 100%;
    height: 100%;
  }
  .cq-icon-overlay.incorrect {
    color: var(--color-incorrect, red);
    position: absolute;
    width: 100%;
    height: 100%;
  }
</style>
