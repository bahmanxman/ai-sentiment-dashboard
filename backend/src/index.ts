import express from "express";
import cors from "cors";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// --- Define the Global Moods ---
type Mood = "ANGRY" | "HAPPY" | "NEUTRAL" | "VOLATILE";
const MOODS: Mood[] = ["ANGRY", "HAPPY", "NEUTRAL", "VOLATILE"];

// Pick a random mood every time the server restarts
const CURRENT_MOOD = MOODS[Math.floor(Math.random() * MOODS.length)];

console.log(`-----------------------------------------`);
console.log(`Current Mood: ${CURRENT_MOOD}`);
console.log(`-----------------------------------------`);

const USERS = [
  "Alex",
  "Jordan",
  "Taylor",
  "Casey",
  "Riley",
  "Morgan",
  "Quinn",
  "Skyler",
];
const MESSAGES = [
  "Incredible performance!",
  "Too slow...",
  "Average results.",
  "Highly recommend.",
  "Waste of time.",
  "Solid build.",
  "Buggy interface.",
  "Perfectly balanced.",
  "AI insights are sharp.",
  "Missing features.",
  "Love the dark mode!",
  "Data is skewed.",
];

// --- Message generator ---
const generateBatch = (count: number) => {
  return Array.from({ length: count }, () => {
    const text = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

    // 1. Determine Base Score from Text Keywords
    let score = 0.5; // Start neutral

    if (
      text?.includes("Incredible") ||
      text?.includes("Perfectly") ||
      text?.includes("Love")
    ) {
      score = 0.85;
    } else if (text?.includes("solid") || text?.includes("sharp")) {
      score = 0.7;
    } else if (
      text?.includes("slow") ||
      text?.includes("Buggy") ||
      text?.includes("Waste")
    ) {
      score = 0.15;
    } else if (text?.includes("Missing") || text?.includes("Average")) {
      score = 0.4;
    }

    // This moves the base score toward the mood without completely destroying the keyword meaning
    switch (CURRENT_MOOD) {
      case "HAPPY":
        score += 0.15; // Everyone is a bit more forgiving
        break;
      case "ANGRY":
        score -= 0.15; // Everyone is a bit more grumpy
        break;
      case "NEUTRAL":
        // Pull score slightly toward 0.5
        score = score + (0.5 - score) * 0.3;
        break;
      case "VOLATILE":
        score += (Math.random() - 0.5) * 0.4; // Add chaos
        break;
    }

    // Add a tiny bit of random "jitter" and clamp between 0 and 1
    const finalScore = Math.max(
      0,
      Math.min(1, score + (Math.random() - 0.5) * 0.1),
    );

    return {
      id: crypto.randomUUID(),
      u: USERS[Math.floor(Math.random() * USERS.length)],
      t: text,
      s: parseFloat(finalScore.toFixed(2)),
      ts: Date.now(),
    };
  });
};

app.get("/api/sentiment/stream", (req, res) => {
  const count = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
  res.json({
    mood: CURRENT_MOOD,
    count,
    data: generateBatch(count),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Message generator running at http://localhost:${PORT}`);
});
