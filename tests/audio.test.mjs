import assert from "node:assert/strict";
import test from "node:test";
import { SignalAudio } from "../app/lib/audio.ts";
import { buildSequence } from "../app/lib/morse.ts";

function context(resume = () => Promise.resolve()) {
  const nodes = [];
  const ctx = {
    state: "suspended", currentTime: 10, destination: {}, nodes,
    resume, closeCalls: 0,
    close() { this.state = "closed"; this.closeCalls++; return Promise.resolve(); },
    createOscillator() {
      const node = { frequency: { value: 0 }, stops: [], disconnected: false, onended: null,
        connect() {}, start(time) { this.started = time; }, stop(time) { this.stops.push(time); }, disconnect() { this.disconnected = true; } };
      nodes.push(node); return node;
    },
    createGain() {
      const gain = { events: [], connect() {}, disconnect() { this.disconnected = true; } };
      gain.gain = { setValueAtTime(value, time) { gain.events.push([value, time]); }, linearRampToValueAtTime(value, time) { gain.events.push([value, time]); } };
      ctx.gain = gain; return gain;
    },
  };
  return ctx;
}
const sequence = buildSequence(". / .", 12);
test("Stop really stops oscillator, disconnects nodes and closes AudioContext", async () => {
  const ctx = context(); const player = new SignalAudio(() => ctx);
  await player.play(sequence, 700, () => assert.fail("Stop must not fire natural completion"));
  assert.equal(ctx.nodes[0].frequency.value, 700);
  assert.equal(ctx.nodes[0].stops.length, 1); // Scheduled natural end.
  player.stop();
  assert.equal(ctx.nodes[0].stops.at(-1), undefined); // Immediate stop, not only a UI timer.
  assert.equal(ctx.nodes[0].onended, null);
  assert.equal(ctx.nodes[0].disconnected, true);
  assert.equal(ctx.gain.disconnected, true);
  assert.equal(ctx.closeCalls, 1);
  player.stop(); assert.equal(ctx.closeCalls, 1);
});
test("stopping while resume is pending cannot start audio afterward", async () => {
  let resolve; const resumed = new Promise(r => { resolve = r; });
  const ctx = context(() => resumed); const player = new SignalAudio(() => ctx);
  const started = player.play(sequence, 700, () => {});
  player.stop(); resolve();
  assert.equal(await started, false);
  assert.equal(ctx.nodes.length, 0); assert.equal(ctx.state, "closed");
});
test("new playback replaces the previous resources without overlap", async () => {
  const first = context(); const second = context(); const pool = [first, second];
  const player = new SignalAudio(() => pool.shift());
  await player.play(sequence, 700, () => {});
  await player.play(sequence, 500, () => {});
  assert.equal(first.state, "closed"); assert.equal(first.nodes[0].stops.at(-1), undefined);
  assert.equal(second.nodes[0].frequency.value, 500); assert.notEqual(second.state, "closed");
  player.stop();
});
test("natural completion cleans up and cannot fire twice", async () => {
  const ctx = context(); const player = new SignalAudio(() => ctx); let completed = 0;
  await player.play(sequence, 700, () => completed++);
  const ended = ctx.nodes[0].onended; ended(); ended();
  assert.equal(completed, 1); assert.equal(ctx.state, "closed");
});
test("resume failure releases context and propagates a recoverable error", async () => {
  const ctx = context(() => Promise.reject(new Error("NotAllowedError")));
  const player = new SignalAudio(() => ctx);
  await assert.rejects(player.play(sequence, 700, () => {}), /NotAllowedError/);
  assert.equal(ctx.state, "closed"); assert.equal(ctx.nodes.length, 0);
});
test("practice volume scales the actual gain without changing Morse timing", async () => {
  const ctx = context(); const player = new SignalAudio(() => ctx);
  await player.play(sequence, 700, () => {}, .5);
  assert.equal(Math.max(...ctx.gain.events.map(e => e[0])), .09);
  assert.ok(Math.abs(ctx.nodes[0].stops[0] - ctx.nodes[0].started - (sequence.total / 1000 + .02)) < 1e-9);
  player.stop();
});
test("invalid volume is rejected before creating an audio context", async () => {
  const player = new SignalAudio(() => assert.fail("Must not allocate audio resources"));
  for (const volume of [-1, NaN, 2]) await assert.rejects(player.play(sequence, 700, () => {}, volume), /Volume/);
});
