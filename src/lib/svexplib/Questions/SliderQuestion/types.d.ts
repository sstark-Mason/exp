export type SliderQuestionProps = {
    qid: string;
    questionText: string;
    range: [number, number];
    step?: number;
    initialValue?: number;
    tickInterval?: number;
    rangeLabels?: [string, string];
    showValueLabel?: boolean;
    required: boolean;
    
    onComplete?: () => void;
    exportValue?: (qid: string, value: number | null) => void;
}