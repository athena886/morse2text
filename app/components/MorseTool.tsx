"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildSequence, MAX_SIGNAL_MS, translate } from "../lib/morse";
import type { Mode } from "../lib/morse";
import { useSignal } from "./useSignal";

type Entry = { input: string; output: string; mode: "text" | "morse" };
function store(key: string, value: string) { try { localStorage.setItem(key, value); } catch { /* Storage is optional. */ } }
function read(key: string) { try { return localStorage.getItem(key); } catch { return null; } }

export default function MorseTool() {
  const [input, setInput] = useState("HELLO WORLD");
  const [mode, setMode] = useState<Mode>("auto");
  const [speed, setSpeed] = useState(18);
  const [frequency, setFrequency] = useState(700);
  const [theme, setTheme] = useState("dark");
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const [history, setHistory] = useState<Entry[]>([]);
  const [exporting, setExporting] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const { active, lit, play, stop } = useSignal();
  const result = useMemo(() => translate(input, mode), [input, mode]);
  const sequence = useMemo(() => buildSequence(result.morse, speed), [result.morse, speed]);
  const tooLong = sequence.total > MAX_SIGNAL_MS;
  const hasOutput = Boolean(result.output);
  const canSignal = Boolean(result.morse) && !tooLong;
  const direction = result.direction === "morse" ? "Morse → Text" : "Text → Morse";

  const cancelExport = useCallback(() => { workerRef.current?.terminate(); workerRef.current = null; setExporting(false); }, []);
  const changeInput = useCallback((value: string, nextMode?: Mode) => {
    stop(); cancelExport(); setInput(value); setNotice(null); if (nextMode) setMode(nextMode);
  }, [stop, cancelExport]);

  useEffect(() => {
    const savedTheme = read("morse-theme");
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
    try {
      const saved = JSON.parse(read("morse-history") || "[]");
      if (Array.isArray(saved)) setHistory(saved.filter(e => e && typeof e.input === "string" && e.input.length <= 5000 && typeof e.output === "string").slice(0, 5).map(e => ({
        input: e.input, output: e.output, mode: e.mode === "morse" || e.mode === "Morse → Text" ? "morse" : "text",
      })));
    } catch { /* Ignore a corrupt or unavailable history. */ }
    return () => { workerRef.current?.terminate(); };
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; store("morse-theme", theme); }, [theme]);
  useEffect(() => {
    if (!input.trim() || result.issues.length) return;
    const id = setTimeout(() => setHistory(old => {
      const next = [{ input, output: result.output, mode: result.direction }, ...old.filter(e => e.input !== input || e.mode !== result.direction)].slice(0, 5);
      store("morse-history", JSON.stringify(next)); return next;
    }), 800);
    return () => clearTimeout(id);
  }, [input, result]);
  useEffect(() => {
    const buttons = document.querySelectorAll<HTMLElement>("[data-example]");
    const handler = (event: Event) => {
      const value = (event.currentTarget as HTMLElement).dataset.example;
      if (value) { changeInput(value, "text"); document.querySelector("#translator")?.scrollIntoView({ behavior: "smooth" }); }
    };
    buttons.forEach(button => button.addEventListener("click", handler));
    return () => buttons.forEach(button => button.removeEventListener("click", handler));
  }, [changeInput]);

  const send = async (kind: "audio" | "flash" | "vibrate") => {
    if (!canSignal) return;
    setNotice(null);
    try { await play(result.morse, speed, frequency, kind); }
    catch (error) { setNotice({ text: error instanceof Error ? error.message : "Unable to play this signal.", error: true }); }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(result.output); setNotice({ text: "Translation copied." }); }
    catch { setNotice({ text: "Copy is unavailable. Select the translation and copy it manually.", error: true }); }
  };
  const share = async () => {
    try {
      const text = `${input} — ${result.output}`;
      if (navigator.share) await navigator.share({ title: "Morse code", text, url: location.href });
      else { await navigator.clipboard.writeText(text); setNotice({ text: "Share text copied." }); }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setNotice({ text: "Sharing is unavailable. Copy the translation instead.", error: true });
    }
  };
  const download = () => {
    if (!canSignal || exporting) return;
    stop(); setNotice(null);
    try {
      const worker = new Worker(new URL("../lib/wav.worker.ts", import.meta.url), { type: "module" });
      workerRef.current = worker; setExporting(true);
      worker.onmessage = (event: MessageEvent<{ buffer?: ArrayBuffer; error?: string }>) => {
        if (workerRef.current !== worker) return;
        cancelExport();
        if (!event.data.buffer) { setNotice({ text: event.data.error || "Unable to generate the WAV file.", error: true }); return; }
        const url = URL.createObjectURL(new Blob([event.data.buffer], { type: "audio/wav" }));
        const anchor = document.createElement("a"); anchor.href = url; anchor.download = "morse2text.wav";
        document.body.append(anchor); anchor.click(); anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setNotice({ text: "WAV file ready. Check your downloads." });
      };
      worker.onerror = () => { if (workerRef.current === worker) { cancelExport(); setNotice({ text: "Audio export failed. Try a shorter message or another browser.", error: true }); } };
      worker.postMessage({ sequence, frequency });
    } catch { cancelExport(); setNotice({ text: "Audio export is unavailable in this browser.", error: true }); }
  };

  return <div className={`tool-card ${lit ? "is-lit" : ""}`}>
    <div className="tool-top"><div><span className="live-dot" /> LIVE TRANSLATOR</div><button className="theme-toggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle color theme">{theme === "dark" ? "☀" : "☾"}</button></div>
    <div className="mode-bar"><label htmlFor="translation-mode">Translation mode</label><select id="translation-mode" value={mode} onChange={e => { stop(); cancelExport(); setMode(e.target.value as Mode); setNotice(null); }}><option value="auto">Auto-detect</option><option value="text">Text to Morse</option><option value="morse">Morse to text</option></select><span>{direction}</span></div>
    <div className="tool-grid"><div className="input-side"><label htmlFor="morse-input"><span>Your message</span><small>{mode === "auto" ? "Auto-detected" : "Manual mode"}</small></label><textarea id="morse-input" value={input} onChange={e => changeInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); if (active) stop(); else void send("audio"); } }} placeholder="Type text or Morse code…" aria-label="Text or Morse code input" aria-invalid={result.issues.length > 0} aria-describedby="input-help" /><div className="input-bottom"><span>{input.length.toLocaleString("en-US")} / 5,000 characters</span><button onClick={() => changeInput("")}>Clear</button></div></div><div className="output-side"><label><span>Translation</span><small>{result.issues.length ? "Check input" : hasOutput ? "Ready" : "Waiting for input"}</small></label><output aria-label="Translation" aria-live="polite">{result.output || "Your translation appears here"}</output><div className="output-actions"><button disabled={!hasOutput} onClick={copy}>▣ Copy</button><button disabled={!hasOutput || Boolean(result.issues.length)} onClick={share}>↗ Share</button></div></div></div>
    <div className="input-help" id="input-help">Written Morse only, not audio recordings. Separate letters with spaces and words with /. · and − work too. Choose a mode for punctuation.</div>
    {result.issues.map(issue => <p className="tool-feedback error" role="alert" key={issue}>{issue}</p>)}
    {tooLong && <p className="tool-feedback error" role="alert">This signal is {(sequence.total / 1000).toFixed(1)} seconds. Playback and WAV export are limited to two minutes; shorten the message or increase the speed. Text conversion is still available.</p>}
    <div className="signal-panel"><div className="player"><button className="play" disabled={!active && (!canSignal || exporting)} onClick={() => { if (active) stop(); else void send("audio"); }} aria-label={active ? "Stop signal" : "Play Morse audio"}>{active ? "■" : "▶"}</button><div><span role="status">{active === "audio" ? "Playing audio…" : active === "flash" ? "Flashing signal…" : active === "vibrate" ? "Vibrating signal…" : canSignal ? `Ready · ${(sequence.total / 1000).toFixed(1)} seconds` : "Enter a valid message to play"}</span><div className="wave" aria-hidden="true">{Array.from({ length: 28 }, (_, i) => <i key={i} style={{ height: `${8 + ((i * 13) % 22)}px` }} />)}</div></div></div><div className="controls"><label>Speed <b>{speed} WPM</b><input type="range" min="8" max="35" value={speed} onChange={e => { stop(); cancelExport(); setSpeed(+e.target.value); }} /></label><label>Tone <b>{frequency} Hz</b><input type="range" min="400" max="1000" step="50" value={frequency} onChange={e => { stop(); cancelExport(); setFrequency(+e.target.value); }} /></label></div><div className="generator-actions"><button disabled={!canSignal || exporting} onClick={() => { if (active === "flash") stop(); else void send("flash"); }}>✦ Flash</button><button disabled={!canSignal || exporting} onClick={() => { if (active === "vibrate") stop(); else void send("vibrate"); }}>≈ Vibrate</button>{exporting ? <button className="download" onClick={cancelExport}>Cancel WAV export</button> : <button className="download" disabled={!canSignal} onClick={download}>↓ Download WAV</button>}</div></div>
    {exporting && <p className="tool-feedback" role="status">Preparing WAV audio… You can cancel the export.</p>}
    {notice && <p className={`tool-feedback ${notice.error ? "error" : "success"}`} role={notice.error ? "alert" : "status"}>{notice.text}</p>}
    {history.length > 0 && <div className="history"><span>Recent</span>{history.slice(0, 3).map((entry, i) => <button key={i} onClick={() => changeInput(entry.input, entry.mode)}><b>{entry.input.slice(0, 20)}</b><code>{entry.output.slice(0, 30)}</code></button>)}<button onClick={() => { setHistory([]); try { localStorage.removeItem("morse-history"); } catch { /* Optional storage. */ } }}>Clear history</button></div>}
  </div>;
}
