import assert from "node:assert/strict";
import test from "node:test";
import { buildSequence, encodeWav, LETTERS, MAX_SIGNAL_MS, NUMBERS, translate, vibrationPattern } from "../app/lib/morse.ts";

test("known International Morse fixtures convert both ways", () => {
  for (const [text, code] of [
    ["SOS HELP", "... --- ... / .... . .-.. .--."],
    ["HELLO WORLD", ".... . .-.. .-.. --- / .-- --- .-. .-.. -.."],
    ["PARIS", ".--. .- .-. .. ..."],
    ["0123456789", "----- .---- ..--- ...-- ....- ..... -.... --... ---.. ----."],
  ]) {
    assert.equal(translate(text).output, code);
    assert.equal(translate(code).output, text);
  }
});
test("all alphabet and number codes round-trip without loss", () => {
  for (const [letter, code] of [...LETTERS, ...NUMBERS]) assert.equal(translate(translate(letter, "text").output, "morse").output, letter, code);
});
test("Unicode dots, dash variants and underscore decode as written Morse", () => {
  assert.equal(translate("··· −−− ···").output, "SOS");
  assert.equal(translate("••• ——— •••").output, "SOS");
  assert.equal(translate("... ___ ...").output, "SOS");
  assert.equal(translate(".../---/...", "morse").output, "S O S");
});
test("explicit modes resolve punctuation ambiguity", () => {
  assert.equal(translate(".").output, "E");
  assert.equal(translate(".", "text").output, ".-.-.-");
  assert.equal(translate("-", "text").output, "-....-");
  assert.equal(translate("_", "text").output, "..--.-");
  assert.equal(translate("/", "text").output, "-..-.");
});
test("SOS prosign is recognized without guessing other unspaced messages", () => {
  assert.equal(translate("...---...").output, "SOS");
  assert.equal(buildSequence("...---...", 12).pulses.length, 9);
  const invalid = translate("..........");
  assert.equal(invalid.output, "�");
  assert.equal(invalid.morse, "");
  assert.match(invalid.issues[0], /space between letters/);
});
test("invalid input never silently generates a partial signal", () => {
  const emoji = translate("HELP 🙂");
  assert.match(emoji.output, /�/);
  assert.equal(emoji.morse, "");
  assert.match(emoji.issues[0], /Unsupported/);
  assert.equal(translate("not Morse", "morse").morse, "");
  assert.equal(translate("////", "morse").issues.length, 1);
  assert.deepEqual(translate("  ").issues, []);
  assert.equal(translate("x".repeat(5001)).output, "");
  assert.match(translate("x".repeat(5001)).issues[0], /not been shortened/);
});
test("text whitespace becomes a real word boundary", () => {
  assert.equal(translate("  hello\n  world\t ", "text").output, translate("HELLO WORLD").output);
});
test("timing has exact 1:3 marks, 1-unit intra-character, 3-unit letter gaps", () => {
  const sequence = buildSequence(".- .", 12);
  assert.equal(sequence.unit, 100);
  assert.deepEqual(sequence.pulses, [{ start: 0, duration: 100 }, { start: 200, duration: 300 }, { start: 800, duration: 100 }]);
  assert.equal(sequence.total, 900);
});
test("word gap is seven units, never the previous eleven-unit gap", () => {
  const { pulses, total } = buildSequence(". / .", 12);
  assert.equal(pulses[1].start - pulses[0].duration, 700);
  assert.equal(total, 900);
  assert.deepEqual(vibrationPattern(buildSequence(". / .", 12)), [100, 700, 100]);
});
test("PARIS standard has a 50-unit word cycle at several speeds", () => {
  for (const speed of [8, 12, 18, 20, 35]) {
    const sequence = buildSequence(translate("PARIS PARIS").morse, speed);
    assert.ok(Math.abs(sequence.pulses[14].start - 50 * 1200 / speed) < 1e-7);
  }
});
test("invalid speeds and malformed signals are rejected before scheduling", () => {
  for (const speed of [0, -1, NaN, Infinity, 61]) assert.throws(() => buildSequence(".", speed));
  assert.throws(() => buildSequence("hello", 18));
  assert.equal(buildSequence("", 18).total, 0);
});
test("WAV is real mono 16-bit 44.1k PCM with the correct header and duration", () => {
  const wav = encodeWav(buildSequence(". / .", 12), 700);
  const view = new DataView(wav);
  const tag = offset => String.fromCharCode(...new Uint8Array(wav, offset, 4));
  assert.equal(tag(0), "RIFF"); assert.equal(tag(8), "WAVE"); assert.equal(tag(12), "fmt "); assert.equal(tag(36), "data");
  assert.equal(view.getUint16(20, true), 1); assert.equal(view.getUint16(22, true), 1);
  assert.equal(view.getUint32(24, true), 44100); assert.equal(view.getUint16(34, true), 16);
  assert.equal(view.getUint32(4, true), wav.byteLength - 8);
  assert.equal(view.getUint32(40, true), wav.byteLength - 44);
  assert.equal((wav.byteLength - 44) / 2 / 44100, 1.1);
});
test("downloaded waveform contains tones separated by exactly the intended silence", () => {
  const view = new DataView(encodeWav(buildSequence(". / .", 12), 700));
  const samples = (from, to) => Array.from({ length: Math.floor((to - from) * 44100) }, (_, i) => view.getInt16(44 + 2 * (Math.round(from * 44100) + i), true));
  assert.ok(samples(.02, .08).some(x => Math.abs(x) > 1000));
  assert.ok(samples(.101, .799).every(x => x === 0));
  assert.ok(samples(.82, .88).some(x => Math.abs(x) > 1000));
  assert.ok(samples(.901, 1.09).every(x => x === 0));
});
test("oversized, empty and invalid-frequency WAV requests fail before allocation", () => {
  assert.throws(() => encodeWav({ pulses: [{ start: 0, duration: 1 }], total: MAX_SIGNAL_MS + 1 }, 700), /limited/);
  assert.throws(() => encodeWav(buildSequence("", 18), 700));
  assert.throws(() => encodeWav(buildSequence(".", 18), NaN));
});

// A supported punctuation mark may expand to seven signals plus a separator.
test("maximum valid punctuation input produces a timeline without crashing", () => {
  const result = translate("$".repeat(5000), "text");
  assert.equal(result.issues.length, 0);
  assert.equal(result.morse.length, 39999);
  const sequence = buildSequence(result.morse, 18);
  assert.equal(sequence.pulses.length, 35000);
  assert.ok(sequence.total > 120000);
});
