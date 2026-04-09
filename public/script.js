const els = {
    image: document.getElementById("animal-image"),
    name: document.getElementById("animal-name"),
    fact: document.getElementById("animal-fact"),
    next: document.getElementById("next-btn"),
    status: document.getElementById("status"),
    count: document.getElementById("animal-count"),
    placeholder: document.getElementById("animal-placeholder"),
    placeholderEmoji: document.getElementById("animal-emoji"),
    placeholderText: document.getElementById("animal-placeholder-text"),
    quizScore: document.getElementById("quiz-score"),
    quizQuestion: document.getElementById("quiz-question"),
    quizFact: document.getElementById("quiz-fact"),
    quizOptions: document.getElementById("quiz-options"),
    quizFeedback: document.getElementById("quiz-feedback"),
    quizRefresh: document.getElementById("new-quiz-btn")
};

const defaultEmoji = "\u2728";
const QUIZ_LENGTH = 5;

const fallbackAnimals = [
    {
        name: "Octopus",
        fact: "An octopus has three hearts, and two of them stop beating when it swims.",
        image: "/images/octopus.jpg",
        emoji: "\u{1F419}",
        quizClue: "This ocean expert has three hearts, and two of them pause when it swims."
    },
    {
        name: "Wombat",
        fact: "Wombats are known for producing cube-shaped poop.",
        image: "/images/wombat.jpg",
        emoji: "\u{1F43E}",
        quizClue: "This burrow-loving buddy is famous for making cube-shaped poop."
    },
    {
        name: "Axolotl",
        fact: "Axolotls can regrow limbs, parts of their heart, and even sections of their brain.",
        image: "/images/axolotl.jpg",
        emoji: "\u{1F338}",
        quizClue: "This watery wonder can regrow limbs, heart tissue, and even parts of its brain."
    },
    {
        name: "Cheetah",
        fact: "A cheetah can go from 0 to around 60 miles per hour in just a few seconds.",
        image: "/images/cheetah.jpg",
        emoji: "\u{1F406}",
        quizClue: "This spotted sprinter can blast from 0 to around 60 miles per hour in seconds."
    },
    {
        name: "Honeybee",
        fact: "Honeybees communicate with each other by performing a waggle dance.",
        image: "/images/honeybee.jpg",
        emoji: "\u{1F41D}",
        quizClue: "This tiny flyer shares directions with a wiggly waggle dance."
    },
    {
        name: "Penguin",
        fact: "Emperor penguin dads balance their eggs on their feet to keep them warm in the icy cold.",
        image: "/images/penguin.jpg",
        emoji: "\u{1F427}",
        quizClue: "This chilly dad balances an egg on its feet to keep it warm."
    },
    {
        name: "Dolphin",
        fact: "Dolphins use special whistles almost like names to call to each other.",
        image: "/images/dolphin.jpg",
        emoji: "\u{1F42C}",
        quizClue: "This smart swimmer uses signature whistles almost like names."
    },
    {
        name: "Koala",
        fact: "Koalas can snooze for most of the day because eucalyptus leaves do not give them much energy.",
        image: "/images/Koala.webp",
        emoji: "\u{1F428}",
        quizClue: "This sleepy tree climber rests most of the day because eucalyptus leaves give it very little energy."
    },
    {
        name: "Owl",
        fact: "Some owls can turn their heads 270 degrees to look around without moving their bodies.",
        image: "/images/owl.jpg",
        emoji: "\u{1F989}",
        quizClue: "This night flyer can turn its head about 270 degrees."
    },
    {
        name: "Elephant",
        fact: "Elephants can use their trunks to smell, drink, trumpet, and even give gentle hugs.",
        image: "/images/Elephant.webp",
        emoji: "\u{1F418}",
        quizClue: "This gentle giant uses its trunk to smell, drink, trumpet, and even give hugs."
    },
    {
        name: "Rabbit",
        fact: "A happy rabbit may jump and twist in the air in a move called a binky.",
        image: "/images/rabbit.jpg",
        emoji: "\u{1F430}",
        quizClue: "This bouncy friend does a twisty happy jump called a binky."
    },
    {
        name: "Giraffe",
        fact: "A giraffe's tongue can be about 20 inches long and helps it grab tasty leaves from tall trees.",
        image: "/images/Giraffe.jpg",
        emoji: "\u{1F992}",
        quizClue: "This towering leaf lover can use a tongue about 20 inches long to grab leaves."
    }
];

const animalDefaults = Object.fromEntries(
    fallbackAnimals.map(({ name, image, emoji, quizClue }) => [
        String(name).toLowerCase(),
        { image, emoji, quizClue }
    ])
);

let animals = [];
let quizBank = [];
let currentAnimalName = "";
let currentImageRequestId = 0;
const quizState = {
    score: 0,
    total: 0,
    question: null,
    lastAnswer: "",
    finalFeedback: "",
    isComplete: false,
    saveStatus: "",
    sessionId: 0
};

function getAnimalKey(name) {
    return String(name || "").toLowerCase();
}

function mergeAnimalsByName(...lists) {
    const animalsByName = new Map();

    for (const list of lists) {
        for (const animal of list) {
            const key = getAnimalKey(animal.name);

            if (!key) {
                continue;
            }

            animalsByName.set(key, {
                ...(animalsByName.get(key) || {}),
                ...animal
            });
        }
    }

    return Array.from(animalsByName.values());
}

function shuffle(items) {
    const shuffled = [...items];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }

    return shuffled;
}

function isFallbackImage(imagePath) {
    const path = String(imagePath || "").trim();

    return (
        !path ||
        path === "/animal.jpg" ||
        path === "animal.jpg" ||
        path === "/animal.svg" ||
        path === "animal.svg" ||
        path.endsWith(".svg")
    );
}

function buildImageCandidates(imagePath, sourceUrl) {
    const path = String(imagePath || "").trim();

    if (!path) {
        return [];
    }

    if (/^(https?:|data:|blob:|file:)/i.test(path)) {
        return [path];
    }

    const pageBaseUrl = new URL(".", window.location.href);
    const sourceBaseUrl = new URL(sourceUrl || window.location.href, window.location.href);
    const candidates = new Set();

    if (path.startsWith("/")) {
        candidates.add(new URL(path.replace(/^\/+/, ""), pageBaseUrl).href);

        if (sourceBaseUrl.protocol !== "file:") {
            candidates.add(new URL(path, `${sourceBaseUrl.origin}/`).href);
        }
    } else {
        candidates.add(new URL(path, pageBaseUrl).href);
        candidates.add(new URL(path, sourceBaseUrl).href);
    }

    return Array.from(candidates);
}

function normalizeEmoji(name, rawEmoji) {
    const fallbackEmoji = animalDefaults[getAnimalKey(name)]?.emoji || defaultEmoji;
    const emoji = typeof rawEmoji === "string" ? rawEmoji.trim() : "";

    return emoji && emoji !== defaultEmoji ? emoji : fallbackEmoji;
}

function normalizeAnimal(animal, sourceUrl) {
    const defaults = animalDefaults[getAnimalKey(animal.name)] || {};
    const rawImage = String(animal.image || "").trim();

    return {
        ...animal,
        emoji: normalizeEmoji(animal.name, animal.emoji),
        quizClue: String(animal.quizClue || defaults.quizClue || animal.fact || "").trim(),
        imagePath: isFallbackImage(rawImage) ? (defaults.image || rawImage) : rawImage,
        imageSourceUrl: sourceUrl,
        image: "",
        hasWorkingImage: false
    };
}

function normalizeAnimals(items, sourceUrl) {
    return items.map((animal) => normalizeAnimal(animal, sourceUrl));
}

function normalizeQuizQuestion(question) {
    const answerName = String(question.answerName || question.answer || "").trim();
    const clue = String(question.clue || "").trim();
    const options = Array.isArray(question.options)
        ? question.options
            .map((option) => ({
                name: String(option.name || "").trim(),
                emoji: normalizeEmoji(option.name, option.emoji)
            }))
            .filter((option) => option.name)
        : [];

    if (!answerName || !clue) {
        return null;
    }

    if (!options.some((option) => option.name === answerName)) {
        options.unshift({
            name: answerName,
            emoji: normalizeEmoji(answerName, "")
        });
    }

    return {
        key: String(question.key || getAnimalKey(answerName)).trim(),
        animalName: String(question.animalName || answerName).trim(),
        prompt: String(question.prompt || "Which animal matches this clue?").trim(),
        clue,
        answerName,
        options: options.slice(0, 3),
        questionType: String(question.questionType || "multiple-choice").trim(),
        isActive: question.isActive !== false
    };
}

async function loadAnimalsFrom(url) {
    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(`Unable to load animal facts from ${url}.`);
    }

    const sourceUrl = res.url || url;

    return {
        animals: normalizeAnimals(await res.json(), sourceUrl),
        sourceUrl
    };
}

async function loadQuizBankFrom(url) {
    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(`Unable to load quiz data from ${url}.`);
    }

    const items = await res.json();

    return items
        .map(normalizeQuizQuestion)
        .filter((question) => question && question.isActive !== false);
}

async function loadAnimals() {
    if (window.location.protocol === "file:") {
        return {
            animals: [],
            sourceUrl: window.location.href
        };
    }

    const urls = ["/api/animals"];

    if (window.location.port && window.location.port !== "5000") {
        urls.push("http://127.0.0.1:5000/api/animals");
    }

    urls.push("animals.json");

    let lastError = new Error("Unable to load animal facts.");

    for (const url of urls) {
        try {
            return await loadAnimalsFrom(url);
        } catch (err) {
            lastError = err;
        }
    }

    throw lastError;
}

function buildFallbackQuizBank() {
    return animals.map((animal) => ({
        key: getAnimalKey(animal.name),
        animalName: animal.name,
        prompt: "Which animal matches this clue?",
        clue: animal.quizClue || animal.fact,
        answerName: animal.name,
        options: shuffle([
            {
                name: animal.name,
                emoji: animal.emoji
            },
            ...shuffle(animals.filter((candidate) => candidate.name !== animal.name))
                .slice(0, 2)
                .map((candidate) => ({
                    name: candidate.name,
                    emoji: candidate.emoji
                }))
        ]),
        questionType: "multiple-choice",
        isActive: true
    }));
}

async function loadQuizBank() {
    if (window.location.protocol === "file:") {
        return buildFallbackQuizBank();
    }

    const urls = [...getApiCandidates("/api/quizzes"), "quizzes.json"];
    let lastError = new Error("Unable to load quiz data.");

    for (const url of urls) {
        try {
            const items = await loadQuizBankFrom(url);

            if (items.length > 0) {
                return items;
            }
        } catch (err) {
            lastError = err;
        }
    }

    console.error("Error loading quiz data. Using built-in quiz bank instead:", lastError);
    return buildFallbackQuizBank();
}

function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(src);
        image.onerror = () => reject(new Error(`Unable to load image: ${src}`));
        image.src = src;
    });
}

async function findWorkingImage(animal) {
    for (const candidate of buildImageCandidates(animal.imagePath, animal.imageSourceUrl)) {
        try {
            await preloadImage(candidate);
            return candidate;
        } catch {
        }
    }

    return "";
}

async function markWorkingImages() {
    await Promise.all(
        animals.map(async (animal) => {
            animal.image = await findWorkingImage(animal);
            animal.hasWorkingImage = Boolean(animal.image);
        })
    );
}

function updateAnimalCount() {
    if (!els.count) {
        return;
    }

    const readyCount = animals.filter((animal) => animal.hasWorkingImage).length;
    els.count.textContent = `${animals.length} fun facts, ${readyCount} real-photo friends`;
}

function clearImage() {
    els.image.removeAttribute("src");
    els.image.style.display = "none";
}

function showPlaceholder(animal, message) {
    clearImage();
    els.placeholder.hidden = false;
    els.placeholderEmoji.textContent = animal.emoji || defaultEmoji;
    els.placeholderText.textContent = `${animal.name}: ${message}`;
}

function getDisplayAnimals() {
    const readyAnimals = animals.filter((animal) => animal.hasWorkingImage);
    return readyAnimals.length > 0 ? readyAnimals : animals;
}

function getQuizSummary() {
    if (quizState.score === QUIZ_LENGTH) {
        return "Perfect score! You are the champion of this animal parade.";
    }

    if (quizState.score >= QUIZ_LENGTH - 1) {
        return "Amazing round! You really know your animal fun facts.";
    }

    if (quizState.score >= Math.ceil(QUIZ_LENGTH / 2)) {
        return "Nice work! You are getting super sharp with these animal clues.";
    }

    return "Fun round! Tap restart and see if you can beat your score.";
}

function getApiCandidates(path) {
    const urls = [path];

    if (window.location.port && window.location.port !== "5000") {
        urls.push(`http://127.0.0.1:5000${path}`);
    }

    return urls;
}

function updateQuizButtonLabel() {
    if (quizState.isComplete) {
        els.quizRefresh.textContent = "Restart Quiz";
        return;
    }

    if (quizState.question?.answered) {
        els.quizRefresh.textContent = "Next Question";
        return;
    }

    els.quizRefresh.textContent = "New Clue";
}

function resetQuiz() {
    quizState.sessionId += 1;
    quizState.score = 0;
    quizState.total = 0;
    quizState.lastAnswer = "";
    quizState.finalFeedback = "";
    quizState.isComplete = false;
    quizState.saveStatus = "";
    quizState.question = buildQuizQuestion();
}

async function saveQuizResult() {
    const sessionId = quizState.sessionId;

    if (window.location.protocol === "file:") {
        if (sessionId === quizState.sessionId) {
            quizState.saveStatus = "Quiz score can only be saved while the app is running through the server.";
            renderQuiz();
        }
        return;
    }

    quizState.saveStatus = "Saving your quiz score to MongoDB...";
    renderQuiz();

    const payload = {
        score: quizState.score,
        totalQuestions: QUIZ_LENGTH,
        summary: getQuizSummary(),
        completedAt: new Date().toISOString()
    };

    for (const url of getApiCandidates("/api/quiz-results")) {
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                throw new Error(`Unable to save quiz result at ${url}.`);
            }

            if (sessionId === quizState.sessionId) {
                quizState.saveStatus = "Quiz score saved to the MongoDB quizResults collection.";
                renderQuiz();
            }
            return;
        } catch (err) {
            console.error("Quiz result save failed:", err);
        }
    }

    if (sessionId === quizState.sessionId) {
        quizState.saveStatus = "Quiz finished, but the score could not be saved right now.";
        renderQuiz();
    }
}

function buildQuizQuestion() {
    const pool = quizBank.length > 0
        ? quizBank
        : buildFallbackQuizBank();

    if (pool.length < 3) {
        return null;
    }

    const prompts = [
        "Which animal matches this clue?",
        "Pop quiz: who does this clue belong to?",
        "Tap the animal behind this fun hint!"
    ];
    const previousAnswer = quizState.lastAnswer;
    const answerPool = pool.length > 3
        ? pool.filter((question) => question.answerName !== previousAnswer)
        : pool;
    const correct = shuffle(answerPool)[0] || shuffle(pool)[0];

    if (!correct) {
        return null;
    }

    return {
        prompt: correct.prompt || shuffle(prompts)[0],
        answer: correct.answerName,
        fact: correct.clue,
        options: shuffle(correct.options),
        selected: "",
        answered: false,
        feedback: "Choose one answer and see how many clues you can beat."
    };
}

function renderQuiz() {
    els.quizOptions.innerHTML = "";

    if (animals.length < 3) {
        els.quizScore.textContent = "Quiz score 0/0";
        els.quizQuestion.textContent = "Quiz is getting the first round ready.";
        els.quizFact.textContent = "Pick the animal that matches the clue.";
        els.quizFeedback.textContent = "";
        els.quizRefresh.textContent = "New Clue";
        els.quizRefresh.disabled = true;
        return;
    }

    if (quizState.isComplete) {
        els.quizScore.textContent = `Final score ${quizState.score}/${QUIZ_LENGTH}`;
        els.quizQuestion.textContent = "Quiz complete!";
        els.quizFact.textContent = getQuizSummary();
        els.quizFeedback.textContent = `${quizState.finalFeedback} ${quizState.saveStatus} Tap Restart Quiz to play again.`.trim();
        els.quizRefresh.textContent = "Restart Quiz";
        els.quizRefresh.disabled = false;
        return;
    }

    if (!quizState.question) {
        quizState.question = buildQuizQuestion();
    }

    if (!quizState.question) {
        els.quizScore.textContent = `Quiz score ${quizState.score}/${quizState.total}`;
        els.quizQuestion.textContent = "The quiz is warming up.";
        els.quizFact.textContent = "Tap New Clue for a fresh multiple-choice round.";
        els.quizFeedback.textContent = "";
        els.quizRefresh.textContent = "New Clue";
        els.quizRefresh.disabled = false;
        return;
    }

    els.quizScore.textContent = `Score ${quizState.score}/${quizState.total} | Question ${quizState.total + 1}/${QUIZ_LENGTH}`;
    els.quizQuestion.textContent = quizState.question.prompt;
    els.quizFact.textContent = quizState.question.fact;
    els.quizFeedback.textContent = quizState.question.feedback;
    updateQuizButtonLabel();
    els.quizRefresh.disabled = false;

    for (const option of quizState.question.options) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "quiz-option";
        button.textContent = `${option.emoji || defaultEmoji} ${option.name}`;

        if (quizState.question.answered) {
            button.disabled = true;

            if (option.name === quizState.question.answer) {
                button.classList.add("is-correct");
            } else if (option.name === quizState.question.selected) {
                button.classList.add("is-wrong");
            }
        }

        button.addEventListener("click", () => {
            if (quizState.question?.answered || quizState.isComplete) {
                return;
            }

            const cheer = [
                `Correct! ${quizState.question.answer} was the right pick.`,
                `You got it! ${quizState.question.answer} was the animal behind that clue.`,
                `Nice work! ${quizState.question.answer} is the right answer.`
            ];
            const tryAgain = [
                `Nice try! That clue belonged to ${quizState.question.answer}.`,
                `Almost! The right answer was ${quizState.question.answer}.`,
                `So close! ${quizState.question.answer} was the animal we wanted.`
            ];
            const isCorrect = option.name === quizState.question.answer;
            const feedback = isCorrect ? shuffle(cheer)[0] : shuffle(tryAgain)[0];

            quizState.total += 1;

            if (isCorrect) {
                quizState.score += 1;
            }

            quizState.lastAnswer = quizState.question.answer;
            quizState.isComplete = quizState.total >= QUIZ_LENGTH;

            if (quizState.isComplete) {
                quizState.question = null;
                quizState.finalFeedback = `${feedback} You finished ${QUIZ_LENGTH} questions.`;
                void saveQuizResult();
            } else {
                quizState.question = {
                    ...quizState.question,
                    selected: option.name,
                    answered: true,
                    feedback
                };
            }

            renderQuiz();
        });

        els.quizOptions.append(button);
    }
}

function pickRandomAnimal(sourceAnimals) {
    let randomIndex = Math.floor(Math.random() * sourceAnimals.length);

    if (sourceAnimals.length > 1) {
        let attempts = 0;

        while (sourceAnimals[randomIndex].name === currentAnimalName && attempts < 8) {
            randomIndex = Math.floor(Math.random() * sourceAnimals.length);
            attempts += 1;
        }
    }

    return sourceAnimals[randomIndex];
}

async function showRandomAnimal() {
    const sourceAnimals = getDisplayAnimals();

    if (!sourceAnimals.length) {
        return;
    }

    const animal = pickRandomAnimal(sourceAnimals);
    const requestId = ++currentImageRequestId;
    currentAnimalName = animal.name;

    els.name.textContent = animal.name;
    els.fact.textContent = animal.fact;
    els.image.alt = animal.name;

    if (!animal.hasWorkingImage || !animal.image) {
        showPlaceholder(animal, "photo is coming soon. Enjoy the fact!");
        return;
    }

    els.placeholder.hidden = true;
    clearImage();

    try {
        await preloadImage(animal.image);

        if (requestId !== currentImageRequestId) {
            return;
        }

        els.placeholder.hidden = true;
        els.image.src = animal.image;
        els.image.style.display = "block";
    } catch {
        if (requestId !== currentImageRequestId) {
            return;
        }

        animal.image = "";
        animal.hasWorkingImage = false;
        updateAnimalCount();

        if (animals.some((item) => item.hasWorkingImage && item.name !== animal.name)) {
            return showRandomAnimal();
        }

        showPlaceholder(animal, "photo is taking a break, but the fact is ready!");
    }
}

async function fetchAnimals() {
    els.status.textContent = "Loading our animal parade...";
    els.next.disabled = true;

    try {
        const { animals: loadedAnimals, sourceUrl } = await loadAnimals();
        animals = mergeAnimalsByName(
            normalizeAnimals(fallbackAnimals, sourceUrl),
            loadedAnimals
        );
        quizBank = await loadQuizBank();
    } catch (err) {
        animals = normalizeAnimals(fallbackAnimals, window.location.href);
        quizBank = buildFallbackQuizBank();
        console.error("Error fetching animals. Using built-in facts instead:", err);
    }

    await markWorkingImages();
    updateAnimalCount();
    resetQuiz();
    renderQuiz();

    if (!animals.length) {
        els.status.textContent = "No animal friends are ready yet.";
        return;
    }

    els.status.textContent = "";
    els.next.disabled = false;
    await showRandomAnimal();
}

els.next.addEventListener("click", () => {
    void showRandomAnimal();
});

els.quizRefresh.addEventListener("click", () => {
    if (quizState.isComplete) {
        resetQuiz();
    } else {
        quizState.question = buildQuizQuestion();
    }

    renderQuiz();
});

void fetchAnimals();
