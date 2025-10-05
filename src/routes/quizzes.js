const express = require("express");
const router = express.Router();
const controller = require("../controllers/quizController");

router.post("/", controller.createQuiz);
router.get("/", controller.listQuizzes);
router.post("/:quizId/questions", controller.addQuestion);
router.get("/:quizId/questions", controller.getQuestions);
router.post("/:quizId/submit", controller.submitAnswers);

module.exports = router;
