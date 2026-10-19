import assert from "node:assert/strict";
import test from "node:test";
import { beginSession, clearPractice, createDeck, DEFAULT_SETTINGS, loadPractice, nextQuestion, PRACTICE_KEY, reviewDeck, savePractice, score, SETS, submitAnswer, validateAnswer } from "../app/lib/practice.ts";

function seeded(seed) { return () => ((seed = Math.imul(seed, 1664525) + 1013904223 >>> 0) / 4294967296); }
function memory() { const data = new Map(); return { getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v), removeItem: k => data.delete(k) }; }
function finish(deck, answer) {
  let state = beginSession(deck);
  for (let i = 0; i < deck.length; i++) state = nextQuestion(submitAnswer(state, answer(deck[i], i)));
  return state;
}
test("all three sets produce ten supported questions, with balanced coverage and no adjacent repeats", () => {
  for (const set of Object.keys(SETS)) for (let seed = 1; seed <= 100; seed++) {
    const deck = createDeck(set, seeded(seed));
    assert.equal(deck.length, 10);
    assert.ok(deck.every(c => SETS[set].characters.includes(c)));
    assert.ok(deck.every((c, i) => !i || c !== deck[i - 1]));
    const firstCycle = deck.slice(0, Math.min(10, SETS[set].characters.length));
    assert.equal(new Set(firstCycle).size, firstCycle.length);
  }
});
test("shuffling is reproducible for fixtures but different seeds create different sessions", () => {
  assert.deepEqual(createDeck("beginner", seeded(10)), createDeck("beginner", seeded(10)));
  assert.notDeepEqual(createDeck("letters", seeded(10)), createDeck("letters", seeded(20)));
});
test("only a single trimmed ASCII letter or digit is accepted, lowercase is normalized", () => {
  assert.equal(validateAnswer(" a ").answer, "A");
  assert.equal(validateAnswer("0").answer, "0");
  for (const invalid of ["", " ", "AB", ".-", "🙂", "é", "ß", "a b", "<script>"]) assert.ok(validateAnswer(invalid).error, invalid);
});
test("invalid input, double submissions and premature Next never change a first answer", () => {
  const ready = beginSession(["A", "B"]);
  assert.equal(nextQuestion(ready), ready);
  assert.equal(submitAnswer(ready, "AB"), ready);
  assert.equal(submitAnswer(ready, ""), ready);
  const checked = submitAnswer(ready, "z");
  assert.equal(checked.attempts[0].outcome, "incorrect");
  assert.equal(submitAnswer(checked, "A"), checked);
  const next = nextQuestion(checked);
  assert.equal(next.index, 1); assert.equal(next.phase, "question");
  assert.equal(nextQuestion(next), next);
});
test("mixed results retain the full denominator and finish only after final Next", () => {
  const deck = createDeck("beginner", seeded(7));
  let state = beginSession(deck);
  for (let i = 0; i < 10; i++) {
    state = submitAnswer(state, i < 6 ? deck[i].toLowerCase() : i < 8 ? "Z" : null);
    if (i === 9) assert.equal(state.phase, "feedback");
    state = nextQuestion(state);
  }
  assert.equal(state.phase, "complete");
  assert.deepEqual(score(state.attempts), { correct: 6, incorrect: 2, skipped: 2, total: 10, percent: 60 });
  assert.equal(submitAnswer(state, "E"), state);
  assert.equal(nextQuestion(state), state);
});
test("perfect, entirely incorrect, entirely skipped, and empty scores are honest", () => {
  const deck = createDeck("numbers", seeded(1));
  for (const [fn, expected] of [[c => c, [10, 0, 0, 100]], [() => "Z", [0, 10, 0, 0]], [() => null, [0, 0, 10, 0]]]) {
    const state = finish(deck, fn); const s = score(state.attempts);
    assert.deepEqual([s.correct, s.incorrect, s.skipped, s.percent], expected);
    assert.equal(s.total, 10); assert.equal(state.phase, "complete");
  }
  assert.equal(score([]).percent, 0);
  assert.equal(score([], 10).total, 10);
});
test("mistake review deduplicates missed and skipped sounds without changing original results", () => {
  const original = finish(["E", "T", "E", "I", "T", "M", "N", "A", "N", "A"], (c, i) => i < 3 ? "Z" : i === 3 ? null : c);
  const frozen = JSON.stringify(original);
  const deck = reviewDeck(original.attempts);
  assert.deepEqual(deck, ["E", "T", "I"]);
  let review = beginSession(deck, "review");
  for (const c of deck) review = nextQuestion(submitAnswer(review, c));
  assert.equal(score(review.attempts).percent, 100);
  assert.equal(score(original.attempts).percent, 60);
  assert.equal(JSON.stringify(original), frozen);
  assert.deepEqual(reviewDeck(review.attempts), []);
  assert.throws(() => beginSession([]));
});
test("completed result and settings survive reload; clear removes the actual storage key", () => {
  const store = memory();
  const record = { id: "test", finishedAt: "2026-10-19T12:00:00Z", settings: { ...DEFAULT_SETTINGS }, attempts: finish(createDeck("beginner", seeded(1)), c => c).attempts };
  assert.equal(savePractice(store, DEFAULT_SETTINGS, [record]), true);
  assert.deepEqual(loadPractice(store), { version: 1, settings: DEFAULT_SETTINGS, records: [record] });
  assert.equal(clearPractice(store), true); assert.equal(store.getItem(PRACTICE_KEY), null);
  assert.deepEqual(loadPractice(store).settings, DEFAULT_SETTINGS); assert.deepEqual(loadPractice(store).records, []);
});
test("blocked storage is nonfatal for training, saving and clearing", () => {
  const denied = { getItem() { throw new Error("SecurityError"); }, setItem() { throw new Error("QuotaExceededError"); }, removeItem() { throw new Error("SecurityError"); } };
  assert.deepEqual(loadPractice(denied).settings, DEFAULT_SETTINGS);
  assert.equal(savePractice(denied, DEFAULT_SETTINGS, []), false);
  assert.equal(clearPractice(denied), false);
  assert.equal(finish(createDeck("beginner", seeded(1)), c => c).phase, "complete");
});
test("corrupt settings, unknown versions, unfinished or dishonest stored results are discarded", () => {
  const store = memory();
  for (const raw of ["bad JSON", "null", '{"version":2}', '{"version":1,"settings":{"set":"__proto__","speed":0,"volume":1000},"records":[null,{},"bad"]}']) {
    store.setItem(PRACTICE_KEY, raw);
    assert.deepEqual(loadPractice(store), { version: 1, settings: DEFAULT_SETTINGS, records: [] });
  }
  const valid = { id: "valid", finishedAt: "2026-10-19T12:00:00Z", settings: DEFAULT_SETTINGS, attempts: finish(createDeck("beginner", seeded(1)), c => c).attempts };
  const wrong = structuredClone(valid); wrong.attempts[0].outcome = "incorrect";
  const incomplete = { ...valid, attempts: valid.attempts.slice(0, 2) };
  store.setItem(PRACTICE_KEY, JSON.stringify({ version: 1, settings: DEFAULT_SETTINGS, records: [wrong, incomplete, valid] }));
  assert.deepEqual(loadPractice(store).records, [valid]);
});
test("only five completed sessions are kept and out-of-range settings cannot load", () => {
  const store = memory();
  const base = { finishedAt: "2026-10-19T12:00:00Z", settings: DEFAULT_SETTINGS, attempts: finish(createDeck("beginner", seeded(1)), c => c).attempts };
  savePractice(store, DEFAULT_SETTINGS, Array.from({ length: 8 }, (_, i) => ({ ...base, id: String(i) })));
  assert.equal(loadPractice(store).records.length, 5);
  for (const settings of [{ ...DEFAULT_SETTINGS, speed: 7 }, { ...DEFAULT_SETTINGS, speed: 36 }, { ...DEFAULT_SETTINGS, volume: 0 }, { ...DEFAULT_SETTINGS, set: "unknown" }]) {
    store.setItem(PRACTICE_KEY, JSON.stringify({ version: 1, settings }));
    assert.deepEqual(loadPractice(store).settings, DEFAULT_SETTINGS);
  }
});
