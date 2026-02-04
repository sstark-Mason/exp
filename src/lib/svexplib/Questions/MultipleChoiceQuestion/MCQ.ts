import type { MultipleChoiceQuestionProps, MultipleChoiceQuestion, ChoiceOptionProps, ChoiceOption } from './types.d.ts';
import { marked } from 'marked';

import debugLib from 'debug';
const debug = debugLib('exp:MCQ');

export const MCQ = {
    new: (props: MultipleChoiceQuestionProps): MultipleChoiceQuestion => getMultipleChoiceQuestion(props),
    reset: (q: MultipleChoiceQuestion): void => resetMultipleChoiceQuestion(q),
    render: (text: string): string => renderFromMarkdown(text),
    selectionEvent: (q: MultipleChoiceQuestion, i: number, target: HTMLInputElement): void => selectionEvent(q, i, target),
    exportScoreArray: (q: MultipleChoiceQuestion): number[] => exportScoreArray(q),
    print: (q: MultipleChoiceQuestion): void => printQuestionState(q),
}

export default MCQ;


// Multiple Choice Question Functions

function getMultipleChoiceQuestion(props: MultipleChoiceQuestionProps): MultipleChoiceQuestion {
    const q = newMultipleChoiceQuestion(props);
    mutateQuestionWithStoredState(q);
    return q;
}

function mutateQuestionWithStoredState(q: MultipleChoiceQuestion): void {
    const storedState = readResponseStateFromSession(q.qid);
    if (!storedState) {
        return;
    }
    for (const rState of storedState) {
        const r = q.responses.find((resp) => resp.propIndex === rState.propIndex);
        if (!r) continue;
        if (r.propIndex !== rState.propIndex) { debug('MISMATCHED PROP INDEX!', r.propIndex, rState.propIndex); }
        r.displayIndex = rState.displayIndex;
        r.isSelected = rState.isSelected;
        r.wasEverSelected = rState.wasEverSelected;
    }
    return;
}

function newMultipleChoiceQuestion(props: MultipleChoiceQuestionProps): MultipleChoiceQuestion {
    const q: MultipleChoiceQuestion = {
        qid: props.qid,
        questionText: props.questionText,
        responses: props.responses.map((r, i) => newChoiceOption(r, i, i)),
        inputType: props.responses.filter((r) => r.isTrue).length > 1 ? 'checkbox' : props.inputType ?? 'radio', // Prevents soft-lock of multiple true with radio, but allows single true with checkbox
        required: props.required,
        randomize: props.randomize ?? false,
        participantSeed: props.participantSeed ?? '',
        showFeedbackOnSelect: props.showFeedbackOnSelect ?? false,
        showScore: props.showScore ?? false,
        allowReset:  props.allowReset ?? false,
        onComplete: props.onComplete,
        exportScoreArray: props.exportScoreArray,
    };

    // debug('New MCQ:', q); // This prints the final post-randomization question, not the pre-randomization snapshot.
    // debug('Responses:', q.responses); // This prints the pre-randomization responses.
    // debug('Unwrapped MCQ:', JSON.parse(JSON.stringify(q))); // This prints the pre-randomization snapshot.
    
    switch (q.randomize) {
        case true:
            q.responses = seededShuffle(q.responses, q.participantSeed + q.qid);
            for (let i = 0; i < q.responses.length; i++) {
                q.responses[i].displayIndex = i;
            }
    }

    // debug('New MCQ:', q); // This prints the final post-randomization question.
    // debug('Responses:', q.responses); // This prints the post-randomization responses.
    // debug('Unwrapped MCQ:', JSON.parse(JSON.stringify(q))); // This prints the post-randomization snapshot.

    return q; 
}

function resetMultipleChoiceQuestion(q: MultipleChoiceQuestion): void {
    for (const r of q.responses) {
        r.isSelected = false;
        r.wasEverSelected = false;
    }
    saveResponseStateToSession(q);
    return;
}

function selectionEvent(q: MultipleChoiceQuestion, i: number, target: HTMLInputElement): void {
    q.responses[i].isSelected = target.checked;
    q.responses[i].wasEverSelected = target.checked ? true : q.responses[i].wasEverSelected;

    switch (q.inputType) {
        case 'radio':
            for (let j = 0; j < q.responses.length; j++) {
                if (j !== i) {
                    q.responses[j].isSelected = false;
                }
            }
            break;
        case 'checkbox':
            break;
    }
    saveResponseStateToSession(q);
    return;
}

function saveResponseStateToSession(q: MultipleChoiceQuestion): void {
    const responseState = q.responses.map((r) => ({
        propIndex: r.propIndex,
        displayIndex: r.displayIndex,
        isSelected: r.isSelected,
        wasEverSelected: r.wasEverSelected,
    }));
    sessionStorage.setItem(`MCQ_${q.qid}`, JSON.stringify(responseState));
}

function readResponseStateFromSession(qid: string): any[] | null {
    const responseStateJSON = sessionStorage.getItem(`MCQ_${qid}`);
    if (!responseStateJSON) {
        return null;
    }
    return JSON.parse(responseStateJSON);
}

function exportScoreArray(q: MultipleChoiceQuestion): number[] {
    const scores = new Array(q.responses.length).fill(0);
    for (const r of q.responses) {
        if (r.isTrue === null) { scores[r.propIndex] = 0; continue; }
        switch (q.showFeedbackOnSelect) {
            case true:
                if (r.isTrue && r.wasEverSelected) { scores[r.propIndex] = 1; continue; }
                if (!r.isTrue && r.wasEverSelected) { scores[r.propIndex] = -1; continue; }
                break;
            case false:
                if (r.isTrue && r.isSelected) { scores[r.propIndex] = 1; continue; }
                if (!r.isTrue && r.isSelected) { scores[r.propIndex] = -1; continue; }
                break;
        }
    }
    return scores;
}

function printQuestionState(q: MultipleChoiceQuestion): void {
    debug('Question State:');
    for (const r of q.responses) {
        debug(`  [${r.displayIndex}] PropIndex: ${r.propIndex}, Text: ${r.text}, isTrue: ${r.isTrue}, isSelected: ${r.isSelected}, wasEverSelected: ${r.wasEverSelected}`);
    }
}

// I love creating work for the garbage collector
// export const resetMultipleChoiceQuestion = (q: MultipleChoiceQuestion): MultipleChoiceQuestion => {
//     return {
//         ...q,
//         responses: q.responses.map((r) => ({
//             ...r,
//             isSelected: false,
//             wasEverSelected: false,
//         })),
//     };
// }


// Choice Option Functions

function newChoiceOption(props: ChoiceOptionProps, propIndex: number, displayIndex: number): ChoiceOption {
    return {
        text: props.text,
        isTrue: props.isTrue ?? null,
        isSelected: false,
        wasEverSelected: false,
        propIndex: propIndex,
        displayIndex: displayIndex,
    }
}


// Utility Functions

export function renderFromMarkdown(text: string): string {
    return marked.parseInline(text, { async: false });
}

// Randomization must be seeded to prevent SSR/hydration mismatches.
// export function shuffleArray<T>(arr: T[]): T[] {
//     const a = arr.slice();
//     for (let i = a.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [a[i], a[j]] = [a[j], a[i]];
//     }
//     return a;
// }

// A simple hashing function to turn strings into numeric seeds
export const cyrb128 = (str: string) => {
    let h1 = 1779033703,
    h2 = 3144134277,
    h3 = 1013904242,
    h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return [(h1 ^ h2 ^ h3 ^ h4) >>> 0];
};

// Mulberry32 generator
export const mulberry32 = (a: number) => {
    return function () {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

// Seeded Fisher-Yates Shuffle
export const seededShuffle = <T>(array: T[], seed: string): T[] => {
    const hash = cyrb128(seed)[0];
    const rand = mulberry32(hash);
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
};