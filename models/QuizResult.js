const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema(
    {
        score: {
            type: Number,
            required: true,
            min: 0
        },
        totalQuestions: {
            type: Number,
            required: true,
            min: 1
        },
        correctAnswers: {
            type: Number,
            required: true,
            min: 0
        },
        wrongAnswers: {
            type: Number,
            required: true,
            min: 0
        },
        percentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        summary: {
            type: String,
            default: ""
        },
        completedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        collection: "quizResults",
        timestamps: true
    }
);

module.exports = mongoose.models.QuizResult || mongoose.model("QuizResult", quizResultSchema);
