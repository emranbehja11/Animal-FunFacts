const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const fallbackAnimals = require("./data/animals.json");
const fallbackQuizzes = require("./data/quizzes.json");
const Animal = require("./models/Animal");
const Quiz = require("./models/Quiz");
const QuizResult = require("./models/QuizResult");
const { seedAnimals } = require("./lib/seedAnimals");
const { seedQuizzes } = require("./lib/seedQuizzes");

const app = express();
const PORT = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;

function mergeAnimalsByName(primaryAnimals, supplementalAnimals) {
    const animalsByName = new Map();

    for (const animal of primaryAnimals) {
        const key = String(animal.name || "").toLowerCase();
        if (key) {
            animalsByName.set(key, animal);
        }
    }

    for (const animal of supplementalAnimals) {
        const key = String(animal.name || "").toLowerCase();
        if (!key) {
            continue;
        }

        animalsByName.set(key, {
            ...animalsByName.get(key),
            ...animal
        });
    }

    return Array.from(animalsByName.values());
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// API endpoint to get all animals
app.get("/api/animals", async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.json(fallbackAnimals);
    }

    try {
        const animals = await Animal.find().lean();
        res.json(mergeAnimalsByName(animals, fallbackAnimals));
    } catch (err) {
        console.error("MongoDB query failed, using fallback data:", err.message);
        res.json(fallbackAnimals);
    }
});

app.get("/api/quizzes", async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.json(fallbackQuizzes);
    }

    try {
        const quizzes = await Quiz.find({ isActive: true }).sort({ animalName: 1 }).lean();
        res.json(quizzes.length > 0 ? quizzes : fallbackQuizzes);
    } catch (err) {
        console.error("MongoDB quizzes query failed, using fallback data:", err.message);
        res.json(fallbackQuizzes);
    }
});

app.get("/api/quiz-results", async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.json([]);
    }

    try {
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
        const results = await QuizResult.find()
            .sort({ completedAt: -1, createdAt: -1 })
            .limit(limit)
            .lean();

        res.json(results);
    } catch (err) {
        console.error("MongoDB quiz-results query failed:", err.message);
        res.status(500).json({ message: "Unable to load quiz results." });
    }
});

app.post("/api/quiz-results", async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: "Database is unavailable right now." });
    }

    const score = Number(req.body.score);
    const totalQuestions = Number(req.body.totalQuestions);
    const summary = String(req.body.summary || "").trim();
    const completedAt = req.body.completedAt ? new Date(req.body.completedAt) : new Date();

    if (!Number.isFinite(score) || !Number.isFinite(totalQuestions) || totalQuestions < 1 || score < 0 || score > totalQuestions) {
        return res.status(400).json({ message: "Quiz result payload is invalid." });
    }

    if (Number.isNaN(completedAt.getTime())) {
        return res.status(400).json({ message: "completedAt must be a valid date." });
    }

    try {
        const result = await QuizResult.create({
            score,
            totalQuestions,
            correctAnswers: score,
            wrongAnswers: totalQuestions - score,
            percentage: Math.round((score / totalQuestions) * 100),
            summary,
            completedAt
        });

        res.status(201).json({
            id: result._id,
            message: "Quiz result saved."
        });
    } catch (err) {
        console.error("MongoDB quiz-results save failed:", err.message);
        res.status(500).json({ message: "Unable to save quiz result." });
    }
});

async function ensureQuizResultsCollection() {
    try {
        await QuizResult.createCollection();
        console.log("MongoDB collection ready: quizResults");
    } catch (err) {
        if (err.codeName !== "NamespaceExists") {
            throw err;
        }
    }
}

async function ensureQuizzesCollection() {
    try {
        await Quiz.createCollection();
        console.log("MongoDB collection ready: quizzes");
    } catch (err) {
        if (err.codeName !== "NamespaceExists") {
            throw err;
        }
    }
}

async function connectToDatabase() {
    if (!mongoUri) {
        console.error("MONGO_URI is missing. Using fallback data.");
        return;
    }

    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000
        });
        console.log("MongoDB connected");

        const result = await seedAnimals();
        console.log(`MongoDB seeded/synced. animals_count=${result.totalAnimals}`);
        await ensureQuizzesCollection();
        const quizResult = await seedQuizzes();
        console.log(`MongoDB seeded/synced. quizzes_count=${quizResult.totalQuizzes}`);
        await ensureQuizResultsCollection();
    } catch (err) {
        console.error("MongoDB connection failed, using fallback data:", err.message);
    }
}

async function startServer() {
    await connectToDatabase();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();
