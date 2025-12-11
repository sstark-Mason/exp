import { onDestroy, onMount } from "svelte";
import { PersistedState } from "runed";
import debug from "debug";
const log = debug("exp:ComprehensionQuestionManager");

interface ComprehensionQuestion {
  qid: string;
  hash: string;
  isPassed: boolean;
}

export class ComprehensionQuestionManager {
  static instances: Map<string, ComprehensionQuestionManager> = new Map();
  private pageId: string;
  private questions: ComprehensionQuestion[] = [];
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


  private constructor(pageId: string, continueButtonId: string | null = null) {
    this.pageId = pageId;
    this.questions = new PersistedState<ComprehensionQuestion[]>(
      `comprehensionQuestions-${this.pageId}`,
      [],
    ).current;
    this.setContinueButtonElement(continueButtonId);
    log(
      `ComprehensionQuestionManager initialized with questions for pageId: ${this.pageId}`,
      this.questions,
    );
  }

  public static getInstance(
    pageId: string,
    continueButtonId: string | null,
  ): ComprehensionQuestionManager {
    if (!ComprehensionQuestionManager.instances.has(pageId)) {
      ComprehensionQuestionManager.instances.set(
        pageId,
        new ComprehensionQuestionManager(pageId, continueButtonId),
      );
    }
    const instance = ComprehensionQuestionManager.instances.get(pageId)!;
    // Update button ID if provided (in case it's called multiple times)
    if (continueButtonId) {
      instance.setContinueButtonElement(continueButtonId);
    }
    return instance;
  }

  public registerQuestion(qid: string, hash: string) {
    const existingQuestion = this.questions.find((q) => q.hash === hash);
    if (existingQuestion) {
      log("Question already registered:", hash);
    } else {
      log("Registering new question:", hash);
      this.questions.push({ qid, hash, isPassed: false });
      new PersistedState<ComprehensionQuestion[]>(
        `comprehensionQuestions-${this.pageId}`,
        this.questions,
      ).current = this.questions;
    }
  }

  public updateQuestionStatus(hash: string, isPassed: boolean) {
    const question = this.questions.find((q) => q.hash === hash);
    if (question) {
      question.isPassed = isPassed;
      log(`Updated question ${question.qid} status to: ${isPassed}`);
      this.enableContinueButton(this.allQuestionsPassed());
    } else {
      log("Question not found for hash:", hash);
    }
  }

  private allQuestionsPassed(): boolean {
    for (const question of this.questions) {
      if (!question.isPassed) {
        log(`Question ${question.qid} not passed. Returning false...`);
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
        log(`Continue button element not found with ID: ${this.continueButtonId}`);
      }
    }
  }
}