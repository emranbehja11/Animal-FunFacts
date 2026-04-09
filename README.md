# Animal Fun Facts

Animal Fun Facts is a small Express + MongoDB app that shows random animal facts with photos and includes a multiple-choice quiz. The app works with MongoDB Atlas and also falls back to local JSON data when the database is unavailable.

## Features

- Random animal fact cards with image fallback handling
- Multiple-choice animal quiz
- MongoDB collections for `animals`, `quizzes`, and `quizResults`
- Local JSON fallback so the app can still run without Atlas

## Tech Stack

- Node.js
- Express
- MongoDB Atlas with Mongoose
- Vanilla HTML, CSS, and JavaScript

## Project Structure

```text
.
|-- data/
|   |-- animals.json
|   `-- quizzes.json
|-- lib/
|   |-- seedAnimals.js
|   `-- seedQuizzes.js
|-- models/
|   |-- Animal.js
|   |-- Quiz.js
|   `-- QuizResult.js
|-- public/
|   |-- images/
|   |-- animals.json
|   |-- quizzes.json
|   |-- index.html
|   |-- script.js
|   `-- style.css
|-- .env.example
|-- package.json
|-- render.yaml
`-- server.js
```

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
copy .env.example .env
```

3. Put your MongoDB Atlas connection string into `.env`:

```env
MONGO_URI=your_mongodb_atlas_connection_string
PORT=5000
```

4. Start the app:

```bash
npm start
```

5. Open:

```text
http://localhost:5000
```

## MongoDB Collections

When Atlas is connected, the app uses these collections:

- `animals`: animal facts, image paths, emoji, and quiz clues
- `quizzes`: quiz questions and answer choices
- `quizResults`: saved quiz scores

If `MONGO_URI` is missing or Atlas is unavailable, the app still loads animal facts and quiz questions from local JSON files in `data/` and `public/`.
