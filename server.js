const path = require("path");
const express = require("express");
const cors = require("cors");
const { addScore, getTopScores } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

// ── API Routes ──────────────────────────────────────────────────────────────

/**
 * GET /api/scores
 * Returns the top 10 high scores.
 */
app.get("/api/scores", (req, res) => {
  try {
    const scores = getTopScores(10);
    res.json({ scores });
  } catch (err) {
    console.error("Error fetching scores:", err);
    res.status(500).json({ error: "Failed to fetch scores" });
  }
});

/**
 * POST /api/scores
 * Body: { name: string, score: number }
 * Saves a new score entry and returns all top scores.
 */
app.post("/api/scores", (req, res) => {
  const { name, score } = req.body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ error: "A valid player name is required" });
  }
  if (typeof score !== "number" || score < 0 || !Number.isInteger(score)) {
    return res.status(400).json({ error: "Score must be a non-negative integer" });
  }

  try {
    addScore(name.trim().slice(0, 30), score);
    const scores = getTopScores(10);
    res.status(201).json({ scores });
  } catch (err) {
    console.error("Error saving score:", err);
    res.status(500).json({ error: "Failed to save score" });
  }
});

// ── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Snake-Pedia backend running at http://localhost:${PORT}`);
});
