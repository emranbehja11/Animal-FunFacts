const mongoose = require("mongoose");

const animalSchema = new mongoose.Schema(
    {
        name: String,
        fact: String,
        image: String,
        emoji: String,
        quizClue: String
    },
    {
        collection: "animals"
    }
);

module.exports = mongoose.models.Animal || mongoose.model("Animal", animalSchema);
