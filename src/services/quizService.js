const db = require('../models/db');

function createQuiz(title) {
  return db.createQuiz(title);
}

function listQuizzes() {
  return db.getAllQuizzes();
}

function addQuestion(quizId, questionPayload) {
  // questionPayload should already be validated
  return db.addQuestion(quizId, questionPayload);
}

function getQuestionsForQuiz(quizId) {
  const qs = db.listQuestions(quizId);
  if (!qs) return null;
  // strip answers (for options remove 'correct', for text remove 'answer')
  return qs.map(q => {
    const clone = { id: q.id, text: q.text, type: q.type };
    if (q.type === 'text') {
      // don't include the stored correct answer
      clone.wordLimit = q.wordLimit;
    } else {
      clone.options = q.options.map(o => ({ id: o.id, text: o.text }));
    }
    return clone;
  });
}

function scoreSubmission(quizId, answersArray) {
  const qs = db.listQuestions(quizId);
  if (!qs) return null;
  const questionMap = new Map(qs.map(q => [q.id, q]));
  let score = 0;
  let total = qs.length;

  for (const ans of answersArray) {
    const q = questionMap.get(ans.questionId);
    if (!q) continue; // unanswered or invalid question id -> treated as incorrect

    if (q.type === 'single') {
      // expect selectedOptionId or selectedOptionIds: [id]
      const selected = Array.isArray(ans.selectedOptionIds) ? ans.selectedOptionIds[0] : ans.selectedOptionId;
      const correctOpt = q.options.find(o => o.correct);
      if (correctOpt && selected === correctOpt.id) score += 1;
    } else if (q.type === 'multiple') {
      // expect selectedOptionIds: array
      const selectedSet = new Set(ans.selectedOptionIds || []);
      const correctSet = new Set(q.options.filter(o => o.correct).map(o => o.id));
      // score only if sets equal
      if (selectedSet.size === correctSet.size && [...selectedSet].every(id => correctSet.has(id))) score += 1;
    } else if (q.type === 'text') {
      const given = (ans.textAnswer || '').trim().toLowerCase();
      const correct = (q.answer || '').trim().toLowerCase();
      if (given && correct && given === correct) score += 1;
    }
  }

  return { score, total };
}

module.exports = { createQuiz, listQuizzes, addQuestion, getQuestionsForQuiz, scoreSubmission };
