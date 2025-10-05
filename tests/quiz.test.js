// Jest + Supertest tests for core flows
const request = require("supertest");
const app = require("../src/app");

describe("Quiz API - core flows", () => {
  let quiz;
  let qSingle, qMultiple, qText;

  test("create a quiz", async () => {
    const res = await request(app)
      .post("/quizzes")
      .send({ title: "Sample Quiz" });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    quiz = res.body;
  });

  test("add questions (single, multiple, text)", async () => {
    // single
    const r1 = await request(app)
      .post(`/quizzes/${quiz.id}/questions`)
      .send({
        text: "Capital of France?",
        type: "single",
        options: [{ text: "Paris", correct: true }, { text: "London" }],
      });
    expect(r1.status).toBe(201);
    qSingle = r1.body;

    // multiple
    const r2 = await request(app)
      .post(`/quizzes/${quiz.id}/questions`)
      .send({
        text: "Pick prime numbers",
        type: "multiple",
        options: [
          { text: "2", correct: true },
          { text: "3", correct: true },
          { text: "4" },
        ],
      });
    expect(r2.status).toBe(201);
    qMultiple = r2.body;

    // text
    const r3 = await request(app).post(`/quizzes/${quiz.id}/questions`).send({
      text: "Name of planet we live on",
      type: "text",
      answer: "Earth",
      wordLimit: 50,
    });
    expect(r3.status).toBe(201);
    qText = r3.body;
  });

  test("fetch questions without answers", async () => {
    const res = await request(app).get(`/quizzes/${quiz.id}/questions`);
    expect(res.status).toBe(200);
    // ensure no 'correct' or 'answer' present
    for (const q of res.body) {
      if (q.type === "text") {
        expect(q.answer).toBeUndefined();
      } else {
        for (const o of q.options) expect(o.correct).toBeUndefined();
      }
    }
  });

  test("submit answers and score", async () => {
    // prepare answers: need actual option ids so fetch internal questions via creation responses saved above
    const singleCorrectId = qSingle.options.find((o) => o.correct).id;
    const multipleCorrectIds = qMultiple.options
      .filter((o) => o.correct)
      .map((o) => o.id);

    const res = await request(app)
      .post(`/quizzes/${quiz.id}/submit`)
      .send({
        answers: [
          { questionId: qSingle.id, selectedOptionId: singleCorrectId },
          { questionId: qMultiple.id, selectedOptionIds: multipleCorrectIds },
          { questionId: qText.id, textAnswer: "Earth" },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.score).toBe(3);
    expect(res.body.total).toBe(3);
  });
});
