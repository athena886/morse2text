export const SETS = {
  beginner: { label: "Beginner · E T I A N M", characters: "ETIANM" },
  letters: { label: "Letters · A–Z", characters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" },
  numbers: { label: "Numbers · 0–9", characters: "0123456789" },
} as const;
export type CharacterSet = keyof typeof SETS;
export type Settings = { set: CharacterSet; speed: number; volume: number };
export const DEFAULT_SETTINGS: Settings = { set: "beginner", speed: 18, volume: 50 };
export const PRACTICE_KEY = "morse-practice-v1";
export type Attempt = { target: string; answer: string | null; outcome: "correct" | "incorrect" | "skipped" };
export type Session = { kind: "session" | "review"; deck: string[]; index: number; phase: "question" | "feedback" | "complete"; attempts: Attempt[] };
export type Record = { id: string; finishedAt: string; settings: Settings; attempts: Attempt[] };
export type SavedPractice = { version: 1; settings: Settings; records: Record[] };

export function createDeck(set: CharacterSet, random = Math.random): string[] {
  const deck: string[] = [];
  while (deck.length < 10) {
    const batch = Array.from(SETS[set].characters);
    for (let i = batch.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [batch[i], batch[j]] = [batch[j], batch[i]];
    }
    if (batch[0] === deck.at(-1)) [batch[0], batch[1]] = [batch[1], batch[0]];
    deck.push(...batch.slice(0, 10 - deck.length));
  }
  return deck;
}
export function beginSession(deck: string[], kind: Session["kind"] = "session"): Session {
  if (!deck.length || deck.length > 10 || deck.some(c => !/^[A-Z0-9]$/.test(c))) throw new Error("Choose a valid character set.");
  return { kind, deck: [...deck], index: 0, phase: "question", attempts: [] };
}
export function validateAnswer(input: string) {
  const answer = input.trim().toUpperCase();
  return /^[A-Z0-9]$/.test(answer) ? { answer, error: "" } : { answer: "", error: "Enter one letter (A–Z) or number (0–9), then check your answer." };
}
export function submitAnswer(session: Session, input: string | null): Session {
  if (session.phase !== "question") return session;
  const parsed = input === null ? null : validateAnswer(input);
  if (parsed?.error) return session;
  const target = session.deck[session.index];
  const answer = parsed?.answer ?? null;
  const outcome = answer === null ? "skipped" : answer === target ? "correct" : "incorrect";
  return { ...session, phase: "feedback", attempts: [...session.attempts, { target, answer, outcome }] };
}
export function nextQuestion(session: Session): Session {
  if (session.phase !== "feedback") return session;
  return session.index === session.deck.length - 1
    ? { ...session, phase: "complete" }
    : { ...session, index: session.index + 1, phase: "question" };
}
export function score(attempts: Attempt[], total = attempts.length) {
  const correct = attempts.filter(a => a.outcome === "correct").length;
  const incorrect = attempts.filter(a => a.outcome === "incorrect").length;
  const skipped = attempts.filter(a => a.outcome === "skipped").length;
  return { correct, incorrect, skipped, total, percent: total ? Math.round(correct / total * 100) : 0 };
}
export function reviewDeck(attempts: Attempt[]) {
  return [...new Set(attempts.filter(a => a.outcome !== "correct").map(a => a.target))];
}
function validSettings(value: unknown): value is Settings {
  if (!value || typeof value !== "object") return false;
  const s = value as Settings;
  return Object.hasOwn(SETS, s.set) && Number.isInteger(s.speed) && s.speed >= 8 && s.speed <= 35 && Number.isInteger(s.volume) && s.volume >= 10 && s.volume <= 100;
}
function validRecord(value: unknown): value is Record {
  if (!value || typeof value !== "object") return false;
  const r = value as Record;
  if (typeof r.id !== "string" || r.id.length > 100 || typeof r.finishedAt !== "string" || !Number.isFinite(Date.parse(r.finishedAt)) || !validSettings(r.settings) || !Array.isArray(r.attempts) || r.attempts.length !== 10) return false;
  return r.attempts.every(a => a && typeof a.target === "string" && SETS[r.settings.set].characters.includes(a.target) && /^[A-Z0-9]$/.test(a.target) && (
    a.outcome === "skipped" ? a.answer === null :
    typeof a.answer === "string" && /^[A-Z0-9]$/.test(a.answer) && a.outcome === (a.answer === a.target ? "correct" : "incorrect")
  ));
}
export type PracticeStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export function loadPractice(storage: PracticeStorage): SavedPractice {
  const fallback: SavedPractice = { version: 1, settings: { ...DEFAULT_SETTINGS }, records: [] };
  try {
    const value = JSON.parse(storage.getItem(PRACTICE_KEY) || "null");
    if (value?.version !== 1) return fallback;
    return { version: 1, settings: validSettings(value.settings) ? value.settings : fallback.settings,
      records: Array.isArray(value.records) ? value.records.filter(validRecord).slice(0, 5) : [] };
  } catch { return fallback; }
}
export function savePractice(storage: PracticeStorage, settings: Settings, records: Record[]) {
  try { storage.setItem(PRACTICE_KEY, JSON.stringify({ version: 1, settings, records: records.slice(0, 5) })); return true; }
  catch { return false; }
}
export function clearPractice(storage: PracticeStorage) {
  try { storage.removeItem(PRACTICE_KEY); return true; } catch { return false; }
}
