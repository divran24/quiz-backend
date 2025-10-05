# Quiz Backend

A simple Node.js/Express backend for creating, managing, and taking quizzes. It supports quiz creation, adding questions (single choice, multiple choice, text), submitting answers, and scoring. All data is stored in-memory (no database required).

## Setup & Run Locally

1. **Clone the repository:**
   ```sh
   git clone https://github.com/divran24/quiz-backend.git
   cd quiz-backend
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Start the server:**
   ```sh
   npm run dev
   ```
   The server will start on [http://localhost:2000](http://localhost:2000).

## Running Test Cases

Test cases are written using Jest and Supertest.

To run all tests:

```sh
npx jest
```

Or to run the specific test file:

```sh
npx jest tests/quiz.test.js
```

## Assumptions & Design Choices

- **In-memory storage:** All quizzes and questions are stored in memory. Data will be lost when the server restarts.
- **No authentication:** The API is open and does not require user authentication.
- **Validation:**
  - Single choice questions must have exactly one correct option.
  - Multiple choice questions must have at least one correct option.
  - Text questions require an answer and have a word limit (default and max 300 characters).
- **Stateless scoring:** Submitting answers returns a score for that submission only; scores are not tracked per user/session.
- **API Endpoints:**
  - `POST /quizzes` — Create a quiz
  - `GET /quizzes` — List all quizzes
  - `POST /quizzes/:quizId/questions` — Add a question
  - `GET /quizzes/:quizId/questions` — List questions for a quiz
  - `POST /quizzes/:quizId/submit` — Submit answers and get score

---

## Testing the API with Postman

You can test the API endpoints using [Postman](https://www.postman.com/):

### 1. Create a Quiz

**POST** `http://localhost:2000/quizzes`
Body (raw, JSON):

```json
{
  "title": "Sample Quiz"
}
```

### 2. List All Quizzes

**GET** `http://localhost:2000/quizzes`

### 3. Add a Question to a Quiz

**POST** `http://localhost:2000/quizzes/{quizId}/questions`
Replace `{quizId}` with the actual quiz ID.

**Single Choice Example:**

```json
{
  "text": "What is 2 + 2?",
  "type": "single",
  "options": [
    { "text": "3", "correct": false },
    { "text": "4", "correct": true },
    { "text": "5", "correct": false }
  ]
}
```

**Multiple Choice Example:**

```json
{
  "text": "Select all prime numbers.",
  "type": "multiple",
  "options": [
    { "text": "2", "correct": true },
    { "text": "3", "correct": true },
    { "text": "4", "correct": false }
  ]
}
```

**Text Answer Example:**

```json
{
  "text": "What is the capital of France?",
  "type": "text",
  "answer": "Paris",
  "wordLimit": 50
}
```

### 4. List Questions for a Quiz

**GET** `http://localhost:2000/quizzes/{quizId}/questions`

### 5. Submit Answers to a Quiz

**POST** `http://localhost:2000/quizzes/{quizId}/submit`
Body (raw, JSON):

```json
{
  "answers": [
    { "questionId": "<questionId>", "selectedOptionId": "<optionId>" },
    {
      "questionId": "<questionId>",
      "selectedOptionIds": ["<optionId1>", "<optionId2>"]
    },
    { "questionId": "<questionId>", "textAnswer": "Your answer here" }
  ]
}
```

Replace `<questionId>` and `<optionId>` with actual IDs from your quiz/questions.

---
