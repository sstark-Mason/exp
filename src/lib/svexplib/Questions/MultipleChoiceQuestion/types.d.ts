// deno-lint-ignore-file no-explicit-any

export type ChoiceOptionProps = {
    text: string,
    isTrue?: boolean,
}

export type ChoiceOption = Omit<ChoiceOptionProps, 'isTrue'> & {
    isTrue: boolean | null,
    propIndex: number,
    displayIndex: number,
    wasEverSelected: boolean,
    isSelected: boolean,
}


export type MultipleChoiceQuestionProps = {
    qid: string;
    questionText: string;
    responses: ChoiceOptionProps[];
    inputType?: 'radio' | 'checkbox';
    required: boolean;
    randomize?: boolean;
    participantSeed?: string;
    showFeedbackOnSelect?: boolean;
    showScore?: boolean;
    allowReset?: boolean;
    onComplete?: () => void;
    exportScoreArray?: (qid: string, scoreArray: number[]) => void;
}

export type MultipleChoiceQuestion = Omit<MultipleChoiceQuestionProps, 'responses' | 'inputType'> & {
    responses: ChoiceOption[];
    inputType: 'radio' | 'checkbox';
}

// Example usage:

// <!-- <MultipleChoiceQuestion
// bind:bindableComplete={qStates[0].completed}
// bind:bindableScoreArray={qStates[0].scoreArray}
// props={{
//     qid: qStates[0].qid,
//     questionText: "What is the main goal in each round of the game?",
//     responses: [
//         { text: "To choose the <u>same</u> option as the other player.", isTrue: true },
//         { text: "To choose a <u>different</u> option than the other player.", isTrue: false },
//         { text: "To choose my <u>favorite</u> option.", isTrue: false },
//     ],
//     required: true,
//     randomize: true,
//     participantSeed: exp.pID,
//     showFeedbackOnSelect: true,
//     allowReset: false,
//     exportScoreArray: (qid: string, scoreArray: number[]) => { updateDb(qid, scoreArray); },
// }}/>