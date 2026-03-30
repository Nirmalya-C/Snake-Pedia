const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "scores.json");

/** Load the database file, returning an empty array if it does not exist. */
function load() {
  if (!fs.existsSync(DB_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  } catch (_) {
    return [];
  }
}

/** Persist the scores array to disk. */
function save(scores) {
  fs.writeFileSync(DB_PATH, JSON.stringify(scores, null, 2), "utf8");
}

/**
 * Insert a new score entry.
 * @param {string} name  - Player name
 * @param {number} score - Player score
 */
function addScore(name, score) {
  const scores = load();
  scores.push({ name, score, created_at: new Date().toISOString() });
  save(scores);
}

/**
 * Return the top N scores ordered by score descending.
 * @param {number} limit - maximum number of entries to return (default 10)
 */
function getTopScores(limit = 10) {
  const scores = load();
  return scores
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

module.exports = { addScore, getTopScores };

