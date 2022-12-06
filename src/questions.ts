interface Question {
  equation: string;
  answers: [string, string, string, string];
  checkedAnswerIndex?: string;
}

const QUESTIONS: Question[] = [
  {
    equation: '2 + 2',
    answers: ['1', '2', '3', '4'],
  },
  {
    equation: '2 + 2 * 2',
    answers: ['6', '10', '8', '2'],
  },
  {
    equation: '420 - 20',
    answers: ['420', '380', '400', '390'],
  },
  {
    equation: '24 / 6',
    answers: ['4', '8', '6', '12'],
  },
  {
    equation: '7 * 7',
    answers: ['39', '49', '59', '69'],
  },
];

export default QUESTIONS;
