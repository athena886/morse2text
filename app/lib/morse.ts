export const LETTERS = [
  ["A", ".-"], ["B", "-..."], ["C", "-.-."], ["D", "-.."], ["E", "."],
  ["F", "..-."], ["G", "--."], ["H", "...."], ["I", ".."], ["J", ".---"],
  ["K", "-.-"], ["L", ".-.."], ["M", "--"], ["N", "-."], ["O", "---"],
  ["P", ".--."], ["Q", "--.-"], ["R", ".-."], ["S", "..."], ["T", "-"],
  ["U", "..-"], ["V", "...-"], ["W", ".--"], ["X", "-..-"], ["Y", "-.--"], ["Z", "--.."],
] as const;
export const NUMBERS = [
  ["0", "-----"], ["1", ".----"], ["2", "..---"], ["3", "...--"], ["4", "....-"],
  ["5", "....."], ["6", "-...."], ["7", "--..."], ["8", "---.."], ["9", "----."],
] as const;
export const MORSE: Record<string, string> = Object.fromEntries([
  ...LETTERS, ...NUMBERS,
  [".", ".-.-.-"], [",", "--..--"], ["?", "..--.."], ["!", "-.-.--"], ["'", ".----."],
  ["/", "-..-."], ["(", "-.--."], [")", "-.--.-"], ["&", ".-..."], [":", "---..."],
  [";", "-.-.-."], ["=", "-...-"], ["+", ".-.-."], ["-", "-....-"], ["_", "..--.-"],
  ['"', ".-..-."], ["$", "...-..-"], ["@", ".--.-."],
]);
const REVERSE = Object.fromEntries(Object.entries(MORSE).map(([letter, code]) => [code, letter]));
export const MAX_INPUT_LENGTH = 5000;
export const MAX_SIGNAL_MS = 120_000;
export type Mode = "auto" | "text" | "morse";
export type Pulse = { start: number; duration: number };
export type Sequence = { unit: number; pulses: Pulse[]; total: number };

export function normalizeMorse(input: string) {
  return input.replace(/[·•∙⋅●]/g, ".").replace(/[‐‑‒–—−_]/g, "-").trim();
}

export function translate(input: string, mode: Mode = "auto") {
  const normalized = normalizeMorse(input);
  const direction = mode === "auto" ? (normalized && /^[.\-\s/]+$/.test(normalized) ? "morse" : "text") : mode;
  const issues: string[] = [];
  if (input.length > MAX_INPUT_LENGTH) {
    return { direction, output: "", morse: "", issues: ["Use 5,000 characters or fewer. Your input has not been shortened."] };
  }
  if (!input.trim()) return { direction, output: "", morse: "", issues };
  let output = "";
  let morse = "";
  if (direction === "text") {
    const unsupported = new Set<string>();
    morse = input.trim().toUpperCase().split(/\s+/).map(word => Array.from(word).map(char => {
      if (MORSE[char]) return MORSE[char];
      unsupported.add(char);
      return "�";
    }).join(" ")).join(" / ");
    if (unsupported.size) issues.push(`Unsupported characters: ${[...unsupported].slice(0, 10).join(" ")}. Remove or replace them before playing or downloading.`);
    output = morse;
  } else {
    const words = normalized.split(/\s*\/\s*/).filter(Boolean);
    const invalid = new Set<string>();
    output = words.map(word => word.trim().split(/\s+/).map(code => {
      if (code === "...---...") return "SOS"; // The continuous distress signal, sent without letter gaps.
      if (REVERSE[code]) return REVERSE[code];
      invalid.add(code);
      return "�";
    }).join("")).join(" ");
    morse = words.map(word => word.trim().split(/\s+/).join(" ")).join(" / ");
    if (invalid.size) issues.push(`Unrecognized Morse group: ${[...invalid].slice(0, 3).join(", ")}. Use a space between letters and / between words. Continuous SOS (...---...) is supported; other unspaced messages cannot be decoded unambiguously.`);
    if (!morse) issues.push("Enter dots and dashes, with spaces between letters and / between words.");
  }
  return { direction, output, morse: issues.length ? "" : morse, issues };
}

/** One timeline for audio, light, vibration and export. Durations are milliseconds. */
export function buildSequence(morse: string, wpm: number): Sequence {
  if (!Number.isFinite(wpm) || wpm < 5 || wpm > 60) throw new Error("Speed must be between 5 and 60 WPM.");
  const normalized = normalizeMorse(morse);
  if (normalized.length > MAX_INPUT_LENGTH * 8 || /[^.\-\s/]/.test(normalized)) throw new Error("Invalid Morse signal.");
  const words = normalized.split(/\s*\/\s*/).filter(Boolean);
  const unit = 1200 / wpm;
  const pulses: Pulse[] = [];
  let time = 0;
  words.forEach((word, wordIndex) => {
    const letters = word.trim().split(/\s+/);
    letters.forEach((letter, letterIndex) => {
      for (let i = 0; i < letter.length; i++) {
        const duration = unit * (letter[i] === "." ? 1 : 3);
        pulses.push({ start: time, duration });
        time += duration;
        if (i < letter.length - 1) time += unit;
      }
      if (letterIndex < letters.length - 1) time += 3 * unit;
    });
    if (wordIndex < words.length - 1) time += 7 * unit;
  });
  return { unit, pulses, total: time };
}

export function vibrationPattern(sequence: Sequence) {
  return sequence.pulses.flatMap((pulse, i, pulses) => i === pulses.length - 1
    ? [Math.round(pulse.duration)]
    : [Math.round(pulse.duration), Math.round(pulses[i + 1].start - pulse.start - pulse.duration)]);
}

export function encodeWav(sequence: Sequence, frequency: number): ArrayBuffer {
  if (!sequence.pulses.length || !Number.isFinite(sequence.total) || sequence.total > MAX_SIGNAL_MS || sequence.total < 0) {
    throw new Error("Audio export is limited to two minutes. Shorten your message or increase the speed.");
  }
  if (!Number.isFinite(frequency) || frequency < 100 || frequency > 2000) throw new Error("Invalid audio frequency.");
  const rate = 44100;
  const length = Math.round((sequence.total + 200) / 1000 * rate);
  const buffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(buffer);
  const write = (offset: number, value: string) => Array.from(value).forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
  write(0, "RIFF"); view.setUint32(4, 36 + length * 2, true); write(8, "WAVEfmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true); write(36, "data"); view.setUint32(40, length * 2, true);
  for (const pulse of sequence.pulses) {
    const start = Math.round(pulse.start / 1000 * rate);
    const end = Math.min(length, Math.round((pulse.start + pulse.duration) / 1000 * rate));
    for (let i = start; i < end; i++) {
      const envelope = Math.max(0, Math.min(1, (i - start) / 220, (end - 1 - i) / 220));
      view.setInt16(44 + i * 2, Math.sin(2 * Math.PI * frequency * i / rate) * .35 * envelope * 32767, true);
    }
  }
  return buffer;
}
