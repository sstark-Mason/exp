<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { ComprehensionQuestionManager } from "./ComprehensionQuestionManager.ts";

  import { PersistedState } from "runed";
  import debug from "debug";
  const log = debug("exp:RequiredQuestion");

  // let { qid, text, answers, checkBoxType, continueButtonId } : { qid: string; text: string; answers: string[]; checkBoxType: string; continueButtonId: string; } = $props();

  let { qid, text, answers, checkBoxType, continueButtonId }: {
    qid: string;
    text: string;
    answers: { text: string }[];
    checkBoxType: string;
    continueButtonId?: string | null;
  } = $props();

  interface answerOption {
    cid: string;
    text: string;
    isSelected: boolean;
  }

  interface RequiredQuestion {
    qid: string;
    text: string;
    answers: answerOption[];
    checkBoxType: string;
    continueButtonId: string | null;
    manager?: ComprehensionQuestionManager;
  }

  let answerOptions: answerOption[] = answers.map((ans, index) => ({
    cid: `cid_${index + 1}`,
    text: ans.text,
    isSelected: false,
  }));

  let question: RequiredQuestion = {
    qid,
    text,
    answers: answerOptions,
    checkBoxType,
    continueButtonId: continueButtonId || null,
    manager: undefined,
  };

  const selectedAnswers = new PersistedState<string[]>(
    `${qid}-selected`,
    [],
  );

  onMount(() => {
    log(`Mounting RequiredQuestion with qid: ${question.qid}`);
    question.manager = ComprehensionQuestionManager.getInstance(
      question.continueButtonId,
    );
    question.manager.registerQuestion(question.qid);

    // Restore selected answers from persisted state
    for (const cid of selectedAnswers.current) {
      const input = document.getElementById(cid) as HTMLInputElement;
      const ans = question.answers.find((a) => a.cid === cid);
      if (ans && input) {
        ans.isSelected = true;
        input.checked = true;
      }
    }

    const isAnySelected = selectedAnswers.current.length > 0;
    question.manager.updateQuestionStatus(question.qid, isAnySelected);
  });

  function answerClicked(cid: string) {
    log(`Answer clicked: ${cid} for question: ${question.qid}`);
    const ans = question.answers.find((a) => a.cid === cid);
    if (ans) {
      ans.isSelected = !ans.isSelected;
      log(`Answer ${ans.text} isSelected: ${ans.isSelected}`);
      
      if (ans.isSelected) {
        selectedAnswers.current = [...selectedAnswers.current, cid];
      } else {
        selectedAnswers.current = selectedAnswers.current.filter((id) => id !== cid);
      }
    }

    // Notify the manager about the answer selection
    if (question.manager) {
      const isAnySelected = question.answers.some((a) => a.isSelected);
      question.manager.updateQuestionStatus(question.qid, isAnySelected);
    }
  }
</script>

<h3>{question.text}</h3>
{#each question.answers as ans}
  <input
    type={question.checkBoxType}
    id={ans.cid}
    name={question.qid}
    value={ans.text}
    checked={ans.isSelected}
    onchange={(e) => answerClicked(ans.cid)}
  />
  <label for={ans.cid}>{ans.text}</label><br>
{/each}

<style>
  h3 {
    margin-bottom: 0.3em; /* Adjust as needed, or set to 0 */
    padding-bottom: 0; /* In case padding is applied by a global style */
  }
</style>
