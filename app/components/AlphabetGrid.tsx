"use client";
import { useState } from "react";
import { LETTERS, NUMBERS } from "../lib/morse";

export default function AlphabetGrid() {
  const [status, setStatus] = useState("");
  const copy = async (letter: string, code: string) => {
    try { await navigator.clipboard.writeText(code); setStatus(`Copied ${letter}: ${code}`); }
    catch { setStatus("Copy is unavailable. Select a code and copy it manually."); }
  };
  return <div><div className="alphabet-grid">{[...LETTERS, ...NUMBERS].map(([letter, code]) => <button key={letter} title={`Copy ${letter} in Morse code`} aria-label={`Copy ${letter} in Morse code`} onClick={() => void copy(letter, code)}><b>{letter}</b><code>{code}</code></button>)}</div><p className="chart-feedback" role="status">{status || "Choose a character to copy its Morse code."}</p></div>;
}
