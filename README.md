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

## Images and GitHub

The image files are safe to upload to GitHub because they are stored inside the repository under `public/images/` and referenced with repo-friendly paths like `/images/octopus.jpg`.

That means:

- you do not need online image URLs
- your professor can run the project locally after cloning it
- the same images will work on a deployed app

## Publish to GitHub

This folder is ready for GitHub once you initialize the repository locally.

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git push -u origin main
```

Before pushing:

- keep `.env` private
- keep `node_modules/` out of GitHub
- make sure your Atlas password has not been exposed publicly

## Deploy on Render

This repo includes a `render.yaml` file so Render can detect the app settings automatically.

### Steps

1. Push the repo to GitHub.
2. Sign in to Render and create a new Blueprint from your GitHub repo.
3. Render will read `render.yaml`.
4. When Render asks for `MONGO_URI`, paste your MongoDB Atlas connection string.
5. Deploy the service.
6. After deployment, open the generated `.onrender.com` link and test the app.

### Important Atlas Setting

Your deployed app must be allowed to reach MongoDB Atlas.

In Atlas:

1. Open **Network Access**.
2. Add an IP access list entry for your deployment.
3. For a simple student project, many people use `0.0.0.0/0` to allow access from anywhere.

MongoDB warns that `0.0.0.0/0` allows access from anywhere, so only do this if your database user has a strong username and password.

## Notes for Your Professor

- If you share only the GitHub repository link, your professor will need to run the project locally.
- If you also share the deployed Render link, your professor can open the app directly in a browser.

## Useful Environment Variables

```env
MONGO_URI=your_mongodb_atlas_connection_string
PORT=5000
```

## Official Docs

- Render Blueprint YAML Reference: https://render.com/docs/blueprint-spec
- MongoDB Atlas IP Access List: https://www.mongodb.com/docs/atlas/security/ip-access-list/
