<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { ComprehensionQuestionManager } from "./ComprehensionQuestionManager.ts";
  import { page } from "$app/state";
  import { marked } from "marked";
  import { PersistedState } from "runed";
  
  let { qid, text, reset, answers, fmt, continueButtonId, dbColumn }: {
    qid: string;
    text: string;
    reset?: boolean;
    answers: { text: string; isCorrect: boolean }[];
    fmt?: "markdown" | "html" | "";
    continueButtonId?: string | null;
    dbColumn?: string | null;
  } = $props();

  import * as ccg from "$lib/ccg/ccg.svelte.ts";
  const debug = ccg.debugBase.extend(`ComprehensionQuestion:${qid}`);
  const exp = ccg.getExperimentState();

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
    dbColumn?: string | null;
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
    pageId: page.url.pathname,
    continueButtonId: continueButtonId || null,
    dbColumn: dbColumn || null,
    manager: null,
  };

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

  async function answerClicked(cid: string) {
    const input = document.getElementById(cid) as HTMLInputElement;
    debug("Answer clicked:", cid);
    debug("Selected (checked): ", input.checked);

    revealedAnswers.current.push(cid);

    if (input.checked) {
      selectedAnswers.push(cid);
    } else {
      selectedAnswers = selectedAnswers.filter((id) => id !== cid);
    }
    _selectedAnswers.current = selectedAnswers;

    checkThisAnswer(cid);
    await checkAllAnswers();
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

  async function checkAllAnswers() {
    const onlyCorrectSelected =
      selectedAnswers.every((cid) => correctAnswers.includes(cid)) &&
      selectedAnswers.length === correctAnswers.length;
    if (onlyCorrectSelected) {
      debug(`${question.qid}: all correct answers selected.`);
      question.isPassed = true;
      for (const ans of question.answerOptions) {
        const input = document.getElementById(ans.cid!) as HTMLInputElement;
        input.disabled = true;
        answerLabelClasses[ans.cid].push("disabled");
        question.manager?.updateQuestionStatus(hash, true);
      }
      await pushToDb();
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

  async function pushToDb_0() {
    if (question.dbColumn) {
      // dbValues is an array of -1, 0, and 1. 1 for correct, 0 for never selected, -1 for incorrect.
      const dbValues: number[] = [];
      for (const ans of answers) {
        const answerOption = question.answerOptions.find(
          (a) => a.text === ans.text,
        );
        if (answerOption) {
          if (revealedAnswers.current.includes(answerOption.cid)) {
            if (answerOption.isCorrect) {
              dbValues.push(1);
            } else {
              dbValues.push(-1);
            }
          } else {
            dbValues.push(0);
          }
        } else {
          dbValues.push(0);
        }
      }

      if (db_uid.current) {
        const { error } = await supabase
          .from("participants")
          .update({ [question.dbColumn]: dbValues })
          .eq("uid", db_uid.current);
        if (error) {
          debug(
            `Error pushing comprehension question ${question.qid} results to DB: ${error.message}`,
          );
        }
      } else {
        debug(
          `No db_uid found; cannot push comprehension question ${question.qid} results to DB.`,
        );
      }
      debug(`Pushed comprehension question ${question.qid} results to DB column ${question.dbColumn} as ${dbValues}.`);
    }
  }

    async function pushToDb() {
        if (!question.dbColumn) return;

        const dbValues: number[] = [];
        for (const ans of answers) {
            const answerOption = question.answerOptions.find((a) => a.text === ans.text);
            if (answerOption) {
                if (revealedAnswers.current.includes(answerOption.cid)) {
                    if (answerOption.isCorrect) {
                        dbValues.push(1);
                    } else {
                        dbValues.push(-1);
                    }
                } else {
                    dbValues.push(0);
                }
            } else {
                dbValues.push(0);
            }
        }

        exp.dbUpdateParticipant({ [question.dbColumn]: dbValues });
        debug(`Pushed comprehension question ${question.qid} results to DB column ${question.dbColumn} as ${dbValues}.`);
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

</script>

<span class="question-text">
  {#if fmt === "markdown"}
    {@html marked.parseInline(question.text)}
    <br>
  {:else if fmt === "html"}
    {@html question.text}
    <br>
  {:else}
    <h3>{question.text}</h3>
  {/if}
</span>

{#if question.allowReset}
  <button onclick={() => { resetQuestion(); }}>Reset</button><br>
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
  {#if fmt === "markdown"}
    {@html marked.parseInline(answer.text)}
  {:else if fmt === "html"}
    {@html answer.text}
  {:else}
    {answer.text}
  {/if}
  </label><br>
{/each}
<br>

<style>

  /* Default (light) theme styles */
  :global(:root) {
    --cq-choice-correct-text-color: black;
    --cq-choice-incorrect-text-color: black;
    --cq-choice-correct-bg: forestgreen;
    --cq-choice-incorrect-bg: lightcoral;
    --cq-choice-hover: grey;
    --cq-choice-incorrect-hover: darkred;
  }

  /* Dark theme styles */
  :global(.dark) {
    --cq-choice-correct-text-color: black;
    --cq-choice-incorrect-text-color: black;
    --cq-choice-correct-bg: forestgreen;
    --cq-choice-incorrect-bg: lightcoral;
    --cq-choice-hover: grey;
    --cq-choice-incorrect-hover: darkred;
  }

  .cq-choice {
    color: --cq-choice-text-color;
    font-size: 1.1em;
    margin: 1px;
    padding: 2px;
    border-radius: 4px;
    display: inline-block;
    cursor: pointer;
    &.disabled {
      opacity: 0.6;
    }
    &:hover:not(.disabled) {
      background-color: var(--cq-choice-hover);
    }
  }

  .cq-choice-correct.disabled {
    background-color: var(--cq-choice-correct-bg);
    color: var(--cq-choice-correct-text-color);
    opacity: 1;
  }

  .cq-choice-incorrect {
    background-color: var(--cq-choice-incorrect-bg);
    color: var(--cq-choice-incorrect-text-color);
    &:not(.disabled) {
      &:hover {
        background-color: var(--cq-choice-incorrect-hover);
        color: white;
      }
    }
    &.disabled {
      opacity: 0.4; /* May want different opacities for light and dark themes */
    }
  }

  .disabled {
    pointer-events: none;
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
    opacity: 0; /* Hides the checkbox/radio */
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

  button {
    cursor: pointer;
    margin-top: 0px;
    margin-bottom: 6px;
  }

  h3 {
    margin-bottom: 0.3em; /* Adjust as needed, or set to 0 */
    padding-bottom: 0; /* In case padding is applied by a global style */
  }


</style>
