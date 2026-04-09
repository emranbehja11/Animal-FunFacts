const Quiz = require("../models/Quiz");
const fallbackQuizzes = require("../data/quizzes.json");

async function seedQuizzes() {
    const operations = fallbackQuizzes.map((quiz) => ({
        updateOne: {
            filter: { key: quiz.key },
            update: { $set: quiz },
            upsert: true
        }
    }));

    if (operations.length === 0) {
        return {
            totalQuizzes: 0
        };
    }

    await Quiz.bulkWrite(operations, { ordered: true });

    return {
        totalQuizzes: await Quiz.countDocuments()
    };
}

module.exports = {
    seedQuizzes
};
