const mongoose = require("mongoose");

const quizOptionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        emoji: {
            type: String,
            default: ""
        }
    },
    {
        _id: false
    }
);

const quizSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        animalName: {
            type: String,
            required: true,
            trim: true
        },
        prompt: {
            type: String,
            required: true,
            trim: true
        },
        clue: {
            type: String,
            required: true,
            trim: true
        },
        answerName: {
            type: String,
            required: true,
            trim: true
        },
        options: {
            type: [quizOptionSchema],
            default: []
        },
        questionType: {
            type: String,
            default: "multiple-choice"
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        collection: "quizzes",
        timestamps: true
    }
);

module.exports = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
