import { onDestroy, onMount } from "svelte";
import { PersistedState } from "runed";
import debug from "debug";
const log = debug("exp:ComprehensionQuestionManager");

type ComprehensionQuestion = Record<string, boolean>;

export class ComprehensionQuestionManager {
  static instance: ComprehensionQuestionManager;
  private questions: Record<string, ComprehensionQuestion> = {};
  private continueButtonId: string | null = null;

  public setContinueButtonElement(id: string | null) {
    if (!id) {
      log("No continue button ID provided.");
      return;
    }
    this.continueButtonId = id;
    const button = document.getElementById(id) as HTMLButtonElement;
    if (button) {
      log("Continue button element set:", button);
      button.disabled = true;
    } else {
      log("Continue button element not found with ID:", id);
    }
  }

  private constructor(continueButtonId: string | null = null) {
    // Private constructor to prevent direct instantiation
    this.questions = new PersistedState<Record<string, ComprehensionQuestion>>(
      "comprehensionQuestions",
      {},
    ).current;
    this.setContinueButtonElement(continueButtonId);
    log(
      "ComprehensionQuestionManager initialized with questions:",
      this.questions,
    );
  }

  public static getInstance(
    continueButtonId: string | null,
  ): ComprehensionQuestionManager {
    if (!ComprehensionQuestionManager.instance) {
      ComprehensionQuestionManager.instance = new ComprehensionQuestionManager(
        continueButtonId,
      );
    }
    return ComprehensionQuestionManager.instance;
  }

  public registerQuestion(qid: string) {
    if (this.questions[qid]) {
      log("Question already registered:", qid);
    } else {
      log("Registering new question:", qid);
      this.questions[qid] = { isPassed: false };
    }
  }

  public updateQuestionStatus(qid: string, isPassed: boolean) {
    this.questions[qid].isPassed = isPassed;
    log(`Updated question ${qid} status to:`, isPassed);
    this.enableContinueButton(this.allQuestionsPassed());
  }

  private allQuestionsPassed(): boolean {
    for (const qid in this.questions) {
      if (!this.questions[qid].isPassed) {
        log(`Question ${qid} not passed. Returning false...`);
        return false;
      }
    }
    log("All questions passed.");
    return true;
  }

  private enableContinueButton(enabled: boolean) {
    if (this.continueButtonId) {
      const button = document.getElementById(this.continueButtonId) as HTMLButtonElement;
      if (button) {
        button.disabled = !enabled;
        log(`Continue button ${enabled ? "enabled" : "disabled"}.`);
      } else {
        log("Continue button element not found with ID:", this.continueButtonId);
      }
    }
  }
}