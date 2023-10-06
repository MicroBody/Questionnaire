const fs = require('fs');
const readline = require('readline');

const questionsFile = './questions.json';
const resultsFile = './results.json';

function loadQuestions() {
  try {
    const questionsData = fs.readFileSync(questionsFile);
    return JSON.parse(questionsData).questions;
  } catch (err) {
    console.error('Error loading questions:', err);
    return [];
  }
}

function loadResults() {
  try {
    const resultsData = fs.readFileSync(resultsFile);
    return JSON.parse(resultsData).results;
  } catch (err) {
    console.error('Error loading results:', err);
    return [];
  }
}

function saveResults(results) {
  const data = JSON.stringify({ results });
  fs.writeFileSync(resultsFile, data);
}

async function askQuestion(question, answers) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${question} (${answers && answers.length ? answers.join('/') : ''}) `, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function startQuestionnaire() {
  const questions = loadQuestions();
  const results = loadResults();

  const name = await askQuestion('What is your name?');
  const dateTime = new Date().toISOString();

  let totalScores = { cat: 0, dog: 0, rabbit: 0, fish: 0 };

  for (const question of questions) {
    const answers = question.answers.map((a) => a.answer);
    while (true) {
      answer = await askQuestion(question.question, answers);

      const selectedAnswer = question.answers.find((a) => a.answer.toLowerCase() === answer.toLowerCase());
      if (selectedAnswer) {
        break;
      } else {
        console.log('Invalid answer. Please try again.');
      }
    }

    const selectedAnswer = question.answers.find((a) => a.answer.toLowerCase() === answer.toLowerCase());
    if (selectedAnswer) {
      const scores = selectedAnswer.scores;
      totalScores.cat += scores.cat;
      totalScores.dog += scores.dog;
      totalScores.rabbit += scores.rabbit;
      totalScores.fish += scores.fish;
    }
  }

  const overallScore = Object.values(totalScores).reduce((sum, score) => sum + score, 0);

  const percentageResults = {};

  for (const [pet, score] of Object.entries(totalScores)) {
    const percentage = ((score / overallScore) * 100).toFixed(2);
    percentageResults[pet] = percentage;
  }

  const sortedResults = Object.entries(percentageResults).sort((a, b) => b[1] - a[1]);
  const sortedPercentageResults = Object.fromEntries(sortedResults);

  const result = { name, dateTime, scores: sortedPercentageResults };
  results.push(result);

  saveResults(results);

  console.log('Questionnaire completed successfully!');
  console.log('Results:', sortedPercentageResults);
}

startQuestionnaire().catch((err) => console.error(err));