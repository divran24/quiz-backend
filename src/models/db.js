// Simple in-memory DB. Replace with real DB (Postgres/Mongo) for production.
const { v4: uuidv4 } = require("uuid");

const db = {
  quizzes: new Map(), // -> { id, title, questions: Map(questionId -> question) }
};

function createQuiz(title) {
  const id = uuidv4();
  db.quizzes.set(id, { id, title, questions: new Map() });
  return db.quizzes.get(id);
}

function getAllQuizzes() {
  return Array.from(db.quizzes.values()).map((q) => ({
    id: q.id,
    title: q.title,
    questionCount: q.questions.size,
  }));
}

function getQuiz(quizId) {
  return db.quizzes.get(quizId) || null;
}

function addQuestion(quizId, question) {
  const quiz = getQuiz(quizId);
  if (!quiz) return null;
  const id = uuidv4();
  const q = Object.assign({ id }, question);
  // For option ids
  if (q.options && Array.isArray(q.options)) {
    q.options = q.options.map((opt) => ({
      id: uuidv4(),
      text: opt.text,
      correct: !!opt.correct,
    }));
  }
  quiz.questions.set(id, q);
  return quiz.questions.get(id);
}

function getQuestion(quizId, questionId) {
  const quiz = getQuiz(quizId);
  if (!quiz) return null;
  return quiz.questions.get(questionId) || null;
}

function listQuestions(quizId) {
  const quiz = getQuiz(quizId);
  if (!quiz) return null;
  return Array.from(quiz.questions.values());
}

module.exports = {
  createQuiz,
  getAllQuizzes,
  getQuiz,
  addQuestion,
  getQuestion,
  listQuestions,
};
