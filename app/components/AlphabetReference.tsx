"use client";
import { useState } from "react";
import { LETTERS, NUMBERS } from "../lib/morse";
import { chartSvg } from "../lib/chart";
import { useSignal } from "./useSignal";

export default function AlphabetReference() {
  const [speed, setSpeed] = useState(18);
  const [status, setStatus] = useState("");
  const [current, setCurrent] = useState("");
  const { active, play, stop } = useSignal();
  const copy = async (letter: string, code: string) => {
    try { await navigator.clipboard.writeText(code); setStatus(`Copied ${letter}: ${code}`); }
    catch { setStatus("Copy is unavailable. Select the code and copy it manually."); }
  };
  const listen = async (letter: string, code: string) => {
    setCurrent(letter); setStatus("");
    try { await play(code, speed); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Audio could not start."); }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([chartSvg()], { type: "image/svg+xml;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "morse-code-alphabet.svg";
    document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("SVG chart ready. Open it in a browser to print or scale it without losing quality.");
  };
  const grid = (items: readonly (readonly [string, string])[], label: string) => <div className="reference-grid" aria-label={label}>{items.map(([letter, code]) => <div key={letter}><b>{letter}</b><code>{code}</code><div className="card-actions"><button aria-label={`Listen to ${letter}`} onClick={() => void listen(letter, code)}>Listen</button><button aria-label={`Copy ${letter} in Morse code`} onClick={() => void copy(letter, code)}>Copy</button></div></div>)}</div>;

  return <section className="printable-chart" id="reference-chart" aria-label="Interactive Morse code reference chart">
    <h2 className="print-only">International Morse Code Alphabet</h2>
    <div className="reference-actions"><button className="primary" onClick={() => { stop(); window.print(); }}>Print chart</button><button onClick={download}>Download SVG chart</button><label>Speed <b>{speed} WPM</b><input type="range" min="8" max="35" value={speed} onChange={e => { stop(); setSpeed(+e.target.value); }} /></label><button disabled={!active} onClick={stop}>Stop audio</button></div>
    <p className="chart-feedback" role="status">{status || (active ? `Playing ${current} at ${speed} WPM.` : "Listen to a character, copy its code, or print a clean chart on A4 or Letter paper.")}</p>
    <div className="guide-lead"><div><p className="eyebrow">A–Z reference</p><h2>Letters in Morse code</h2></div><p>A dot lasts one unit and a dash lasts three. Start with E, T, I, A, N and M, then listen to each complete character as a rhythm.</p></div>
    {grid(LETTERS, "Morse code letters A through Z")}
    <div className="guide-lead section-space"><div><p className="eyebrow">0–9 reference</p><h2>Numbers in Morse code</h2></div><p>Each number uses five signals: zero is five dashes and five is five dots. Compare neighboring numbers to hear how the pattern changes.</p></div>
    {grid(NUMBERS, "Morse code numbers zero through nine")}
    <p className="print-only">Dot: 1 unit · Dash: 3 units · Gaps: 1 inside a character, 3 between letters, 7 between words.<br />morse2text.com/morse-code-alphabet/</p>
  </section>;
}
