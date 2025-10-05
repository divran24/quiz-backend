const Joi = require("joi");
const service = require("../services/quizService");

const createQuizSchema = Joi.object({ title: Joi.string().min(1).required() });

const optionSchema = Joi.object({
  text: Joi.string().min(1).required(),
  correct: Joi.boolean().optional(),
});

const questionSchema = Joi.object({
  text: Joi.string().min(1).required(),
  type: Joi.string().valid("single", "multiple", "text").required(),
  options: Joi.when("type", {
    is: Joi.valid("single", "multiple"),
    then: Joi.array().items(optionSchema).min(2).required(),
    otherwise: Joi.forbidden(),
  }),
  // for text questions
  answer: Joi.when("type", {
    is: "text",
    then: Joi.string().max(300).required(),
    otherwise: Joi.forbidden(),
  }),
  wordLimit: Joi.when("type", {
    is: "text",
    then: Joi.number().integer().min(1).max(300).default(300),
    otherwise: Joi.forbidden(),
  }),
});

const submitSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.string().required(),
        selectedOptionIds: Joi.array().items(Joi.string()),
        selectedOptionId: Joi.string(),
        textAnswer: Joi.string().max(300),
      })
    )
    .required(),
});

async function createQuiz(req, res, next) {
  try {
    const { title } = await createQuizSchema.validateAsync(req.body);
    const q = service.createQuiz(title);
    res.status(201).json(q);
  } catch (err) {
    next(err);
  }
}

async function listQuizzes(req, res, next) {
  try {
    const list = service.listQuizzes();
    res.json(list);
  } catch (err) {
    next(err);
  }
}

async function addQuestion(req, res, next) {
  try {
    const { quizId } = req.params;
    const payload = await questionSchema.validateAsync(req.body);
    // extra validation: single must have exactly one correct, multiple must have at least one correct
    if (payload.type === "single") {
      const correctCount = payload.options.filter((o) => o.correct).length;
      if (correctCount !== 1)
        return res
          .status(400)
          .json({ error: "single choice must have exactly 1 correct option" });
    }
    if (payload.type === "multiple") {
      const correctCount = payload.options.filter((o) => o.correct).length;
      if (correctCount < 1)
        return res
          .status(400)
          .json({
            error: "multiple choice must have at least 1 correct option",
          });
    }
    const created = service.addQuestion(quizId, payload);
    if (!created) return res.status(404).json({ error: "quiz not found" });
    // hide correct flags in response? return created but keep security minimal for now
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

async function getQuestions(req, res, next) {
  try {
    const { quizId } = req.params;
    const qs = service.getQuestionsForQuiz(quizId);
    if (!qs) return res.status(404).json({ error: "quiz not found" });
    res.json(qs);
  } catch (err) {
    next(err);
  }
}

async function submitAnswers(req, res, next) {
  try {
    const { quizId } = req.params;
    const payload = await submitSchema.validateAsync(req.body);
    const result = service.scoreSubmission(quizId, payload.answers);
    if (!result) return res.status(404).json({ error: "quiz not found" });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createQuiz,
  addQuestion,
  getQuestions,
  submitAnswers,
  listQuizzes,
};
