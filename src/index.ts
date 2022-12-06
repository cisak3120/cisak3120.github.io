import QUESTIONS from './questions';
import Timer from './timer';
import { enableButton, disableButton } from './utils/disableButtonHelpers';

import './scss/index';

// DOM elements
const questionNumberHeadingElement =
  document.querySelector('.question__number')!;
const questionTimeElement = document.querySelector('.question__time')!;
const questionTextElement = document.querySelector('.question__text')!;

const answerParagraphElements = document.querySelectorAll(
  '.answers__answer__text'
);
const answerInputElements = document.querySelectorAll(
  '.answers__answer__input'
);

const [prevButtonElement, nextButtonElement, finishButtonElement] =
  document.querySelectorAll<HTMLButtonElement>('.navigation__buttons__button')!;

const endgameModalElement = document.querySelector('.endgame-modal')!;
const endgameModalInnerElement: HTMLDivElement = document.querySelector(
  '.endgame-modal__modal'
)!;
const endgameModalButtonElement = document.querySelector(
  '.endgame-modal__modal__buttons__button'
)!;
const endgameModalBackdropElement = document.querySelector(
  '.endgame-modal__backdrop'
)!;
const scoredPointsElement = document.querySelector(
  '.endgame-modal__modal__score__points__scored'
)!;
const totalPointsElement = document.querySelector(
  '.endgame-modal__modal__score__points__total'
)!;
const detailsElement = document.querySelector(
  '.endgame-modal__modal__details'
)!;
const detailsTogglerElement = document.querySelector(
  '.endgame-modal__modal__details__toggler'
)!;

// Initial state
let currentQuestionIndex = 0;
let { equation, answers } = QUESTIONS[currentQuestionIndex];
const timers = QUESTIONS.map(() => new Timer());
updateUI();

// App
(function app() {
  answerInputElements.forEach((answerInputElement, _, answerInputElements) =>
    answerInputElement.addEventListener('change', () => {
      saveCheckedAnswer(answerInputElement as HTMLInputElement);
      displayFinishButton();
      styleCheckedAnswerOnly(answerInputElements);
    })
  );

  initializeTimer();

  prevButtonElement.addEventListener('click', prevButtonClickHandler);
  nextButtonElement.addEventListener('click', nextButtonClickHandler);
  finishButtonElement.addEventListener('click', finishButtonClickHandler);
  endgameModalButtonElement.addEventListener('click', () => location.reload());
  endgameModalBackdropElement.addEventListener('click', () =>
    location.reload()
  );
  detailsTogglerElement.addEventListener('click', detailsTogglerClickHandler, {
    once: true,
  });
})();

// Navigation buttons click handlers
function prevButtonClickHandler() {
  prevButtonGuard();
  currentQuestionIndex--;
  enableButton(nextButtonElement);
  updateState();
  updateUI();
  updateCheckedAnswerStylesOnQuestionChange(answerInputElements);
  manageTimersOnQuestionChange(timers[currentQuestionIndex + 1]);
}

function nextButtonClickHandler() {
  nextButtonGuard();
  currentQuestionIndex++;
  enableButton(prevButtonElement);
  updateState();
  updateUI();
  updateCheckedAnswerStylesOnQuestionChange(answerInputElements);
  manageTimersOnQuestionChange(timers[currentQuestionIndex - 1]);
}

function finishButtonClickHandler() {
  const quizScoreData = getQuizScoreData();
  showQuizEndgameModal(quizScoreData);
  stopAllTimers();
  saveDataToLocalStorage();
}

// Timer
function manageTimersOnQuestionChange(prevTimer: Timer) {
  const currTimer = timers[currentQuestionIndex];
  currTimer.start();
  prevTimer.stop();
}

function initializeTimer() {
  const currTimer = timers[currentQuestionIndex];
  currTimer.start();
  setInterval(
    () =>
      (questionTimeElement.innerHTML = `Time spent: ${timers[
        currentQuestionIndex
      ].totalTime.toString()}<span>s</span>`)
  );
}

function stopAllTimers() {
  timers.forEach((timer) => timer.stop());
}

// Endgame
function getQuizScoreData() {
  const questions = QUESTIONS;
  const quizScoreData = questions.map((question) => {
    const equationResult = eval(question.equation);
    return +question.answers[+question.checkedAnswerIndex!] === equationResult;
  });
  return quizScoreData;
}

function showQuizEndgameModal(quizScoreData: boolean[]) {
  endgameModalElement.classList.remove('endgame-modal--hidden');
  scoredPointsElement.textContent = quizScoreData
    .filter((x) => x)
    .length.toString();
  totalPointsElement.textContent = quizScoreData.length.toString();
}

function detailsTogglerClickHandler() {
  detailsElement.classList.remove('endgame-modal__modal__details--hidden');
  detailsElement.classList.contains('endgame-modal__modal__details--hidden')
    ? (endgameModalInnerElement.style.maxHeight = '16.5rem')
    : (endgameModalInnerElement.style.maxHeight = '40rem');

  let detailsListElement = detailsElement.lastElementChild!;
  let detailsListItemElements: HTMLCollection = detailsListElement.children;

  const detailsListItemsElementsGroup = (
    questionNumber: number,
    timeSpent: number,
    points: boolean
  ) =>
    `
      <li class="endgame-modal__modal__details__list__item ${
        points
          ? 'endgame-modal__modal__details__list__item--succes'
          : 'endgame-modal__modal__details__list__item--danger'
      }">${questionNumber}</li>
      <li class="endgame-modal__modal__details__list__item ${
        points
          ? 'endgame-modal__modal__details__list__item--succes'
          : 'endgame-modal__modal__details__list__item--danger'
      }">${timeSpent}s</li>
      <li class="endgame-modal__modal__details__list__item ${
        points
          ? 'endgame-modal__modal__details__list__item--succes'
          : 'endgame-modal__modal__details__list__item--danger'
      }">${points ? '1' : '0'}</li>
    `;

  const quizScoreData = getQuizScoreData();

  QUESTIONS.forEach((_, index) => {
    detailsListElement.innerHTML += detailsListItemsElementsGroup(
      index + 1,
      timers[index].totalTime,
      quizScoreData[index]
    );
  });

  // Add animations for each list element
  Array.from(detailsListItemElements).forEach(
    (detailsListItemElement, index) => {
      (
        detailsListItemElement as HTMLLIElement
      ).style.animation = `detail-list-item-fade-in ${
        Math.floor(index / 3) * 500
      }ms ${Math.floor(index / 3) * 500}ms forwards`;
    }
  );
}

function saveDataToLocalStorage() {
  localStorage.setItem(
    'GAME_STATS',
    JSON.stringify(
      QUESTIONS.map((QUESTION, index) => ({
        ...QUESTION,
        timeSpent: `${timers[index].totalTime}s`,
      }))
    )
  );
}

// Button guards
function prevButtonGuard() {
  if (currentQuestionIndex === 1) {
    disableButton(prevButtonElement);
    return;
  }
}

function nextButtonGuard() {
  if (currentQuestionIndex + 2 === QUESTIONS.length) {
    disableButton(nextButtonElement);
    return;
  }
}

// DOM and state updates
function updateState() {
  equation = QUESTIONS[currentQuestionIndex].equation;
  answers = QUESTIONS[currentQuestionIndex].answers;
}

function updateUI() {
  updateCurrentQuestionAndAnswersText();
  updateCurrentQuestionHeading();
}

function updateCurrentQuestionAndAnswersText() {
  questionTextElement.innerHTML = `Solve the equation: <span class="question__text__equation">${equation}</span>`;
  answerParagraphElements.forEach((x, index) => {
    x.textContent = answers[index];
  });
}

function updateCurrentQuestionHeading() {
  questionNumberHeadingElement.textContent = `Question ${
    currentQuestionIndex + 1
  }/${QUESTIONS.length}`;
}

// Answers
function styleCheckedAnswerOnly(answerInputElements: NodeList) {
  answerInputElements.forEach((answerInputElement) =>
    toggleCheckedAnswerStyle(answerInputElement as HTMLInputElement)
  );
}

function toggleCheckedAnswerStyle(answerInputElement: HTMLInputElement) {
  answerInputElement.checked
    ? addCheckedAnswerClass(answerInputElement)
    : removeCheckedAnswerClass(answerInputElement);
}

function addCheckedAnswerClass(answerInputElement: HTMLInputElement) {
  answerInputElement.parentElement!.classList.add('answers__answer--checked');
}

function removeCheckedAnswerClass(answerInputElement: HTMLInputElement) {
  answerInputElement.parentElement!.classList.remove(
    'answers__answer--checked'
  );
}

function updateCheckedAnswerStylesOnQuestionChange(
  answerInputElements: NodeList
) {
  answerInputElements.forEach((answerInputElement, index) => {
    removeCheckedAnswerClass(answerInputElement as HTMLInputElement);
    (answerInputElement as HTMLInputElement).checked = false;
  });

  const { checkedAnswerIndex } = QUESTIONS[currentQuestionIndex];
  if (!!!checkedAnswerIndex) return;
  const answerInputElement = answerInputElements[
    +checkedAnswerIndex
  ] as HTMLInputElement;
  answerInputElement.checked = true;
  addCheckedAnswerClass(answerInputElement);
}

function displayFinishButton() {
  areAllAnswersChecked()
    ? finishButtonElement.parentElement!.classList.add(
        'navigation__buttons--finished'
      )
    : finishButtonElement.parentElement!.classList.remove(
        'navigation__buttons--finished'
      );
}

function areAllAnswersChecked() {
  return QUESTIONS.every((QUESTION) => !!QUESTION.checkedAnswerIndex);
}

function saveCheckedAnswer(answerInputElement: HTMLInputElement) {
  QUESTIONS[currentQuestionIndex].checkedAnswerIndex = (
    answerInputElement.id.charCodeAt(0) - 97
  ).toString();
}
