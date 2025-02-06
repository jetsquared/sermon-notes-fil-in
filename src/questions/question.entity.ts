export class Question {
  constructor(partial: {
    id: string;
    questions: QuestionItem[];
    content: string;
  }) {
    Object.assign(this, partial);
  }

  id: string;
  questions: QuestionItem[];
  content: string;  // Full markdown content
}

export interface QuestionItem {
  question: string;
  answer: string;
  context: string;
  blankIndex: number;
} 