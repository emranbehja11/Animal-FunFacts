const Animal = require("../models/Animal");
const fallbackAnimals = require("../data/animals.json");

async function seedAnimals() {
    const operations = fallbackAnimals.map((animal) => ({
        updateOne: {
            filter: { name: animal.name },
            update: { $set: animal },
            upsert: true
        }
    }));

    if (operations.length === 0) {
        return {
            totalAnimals: 0
        };
    }

    await Animal.bulkWrite(operations, { ordered: true });

    return {
        totalAnimals: await Animal.countDocuments()
    };
}

module.exports = {
    seedAnimals
};
