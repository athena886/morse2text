"use client";
import { useState } from "react";
import { translate } from "../lib/morse";
import { useSignal } from "./useSignal";

const samples = [
  { title: "Two short characters", text: "ET" },
  { title: "Six beginner letters", text: "ETIANM" },
  { title: "A short message", text: "MEET ME AT NOON" },
];
export default function ListeningSamples() {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [speed, setSpeed] = useState(18);
  const [error, setError] = useState("");
  const { active, play, stop } = useSignal();
  const listen = async (i: number) => {
    setSelected(i); setRevealed(false); setError("");
    try { await play(translate(samples[i].text, "text").morse, speed); }
    catch (error) { setError(error instanceof Error ? error.message : "Audio could not start."); }
  };
  return <section id="listening-samples" className="listening-samples" aria-labelledby="sample-title">
    <p className="eyebrow">Try it here</p><h2 id="sample-title">Hear your first Morse signals</h2><p>Play a sample, write down what you hear, then reveal the answer. These are listening examples, not a scored quiz. Each character uses the selected speed; replay a sample as often as you need.</p>
    <div className="sample-settings"><label>Speed <b>{speed} WPM</b><input type="range" min="8" max="35" value={speed} onChange={e => { stop(); setSpeed(+e.target.value); }} /></label><button disabled={!active} onClick={stop}>Stop audio</button><span role="status">{active && selected !== null ? `Playing sample ${selected + 1}.` : "Ready to listen."}</span></div>
    <div className="sample-buttons">{samples.map((sample, i) => <button key={sample.title} aria-label={`Listen to sample ${i + 1}`} onClick={() => void listen(i)}><span>Sample {i + 1}</span><b>{sample.title}</b><span>▶ Listen</span></button>)}</div>
    {selected !== null && <div className="sample-answer"><button aria-expanded={revealed} onClick={() => setRevealed(!revealed)}>{revealed ? "Hide answer" : "Reveal answer"}</button>{revealed && <div><b>{samples[selected].text}</b><code>{translate(samples[selected].text, "text").output}</code></div>}</div>}
    {error && <p role="alert" className="tool-feedback error">{error}</p>}
  </section>;
}
