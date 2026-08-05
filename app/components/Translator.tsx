"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const vowels: Record<string, string> = { a: "ᜀ", e: "ᜁ", i: "ᜁ", o: "ᜂ", u: "ᜂ" };
const consonants: Record<string, string> = {
  b: "ᜊ", k: "ᜃ", d: "ᜇ", r: "ᜇ", g: "ᜄ", h: "ᜑ", l: "ᜎ", m: "ᜋ", n: "ᜈ",
  p: "ᜉ", s: "ᜐ", t: "ᜆ", w: "ᜏ", y: "ᜌ", f: "ᜉ", v: "ᜊ", z: "ᜐ", c: "ᜃ", j: "ᜇ", q: "ᜃ", x: "ᜃ᜔ᜐ",
};
const kudlit: Record<string, string> = { a: "", e: "ᜒ", i: "ᜒ", o: "ᜓ", u: "ᜓ" };
const tagalogSignals = new Set(["ang", "ng", "mga", "ako", "ikaw", "mahal", "salamat", "bayan", "puso", "ganda", "para", "hindi", "oo", "natin", "pilipinas"]);

export type Unit = { script: string; latin: string };

export function transliterate(input: string): Unit[] {
  const text = input.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const units: Unit[] = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (!/[a-z]/.test(ch)) { units.push({ script: ch, latin: ch }); i += 1; continue; }
    if (vowels[ch]) { units.push({ script: vowels[ch], latin: ch }); i += 1; continue; }
    let consonant = ch;
    let consumed = 1;
    if (text.slice(i, i + 2) === "ng") { consonant = "n"; consumed = 2; }
    const base = consonants[consonant] ?? ch;
    const next = text[i + consumed];
    if (next && kudlit[next] !== undefined) {
      units.push({ script: base + kudlit[next], latin: text.slice(i, i + consumed + 1) });
      i += consumed + 1;
    } else {
      units.push({ script: base + "᜔", latin: text.slice(i, i + consumed) });
      i += consumed;
    }
  }
  return units;
}

function detectLanguage(text: string) {
  const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
  return words.some((word) => tagalogSignals.has(word) || word.includes("ng")) ? "Tagalog" : "English";
}

export default function Translator({ compact = false, tattooLink = true }: { compact?: boolean; tattooLink?: boolean }) {
  const [text, setText] = useState("Mahal kita");
  const [mode, setMode] = useState("auto");
  const [font, setFont] = useState("noto");
  const [toast, setToast] = useState("");
  const [transparent, setTransparent] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);
  const units = useMemo(() => transliterate(text), [text]);
  const script = units.map((unit) => unit.script).join("");
  const language = mode === "auto" ? detectLanguage(text) : mode === "tl" ? "Tagalog" : "English";

  useEffect(() => {
    const query = new URLSearchParams(window.location.search).get("text");
    if (query) setText(query.slice(0, 500));
  }, []);

  function notify(message: string) { setToast(message); window.setTimeout(() => setToast(""), 1800); }
  async function copy() { await navigator.clipboard.writeText(script); notify("Copied!"); }
  function downloadSvg() {
    const safe = script.replace(/[&<>]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]!));
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="500"><rect width="100%" height="100%" fill="${transparent ? "none" : "#F8F6F0"}"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="Noto Sans Tagalog, sans-serif" font-size="120" fill="#2C1810">${safe}</text></svg>`;
    saveBlob(new Blob([svg], { type: "image/svg+xml" }), "baybayin-translation.svg");
  }
  function downloadPng() {
    const canvas = document.createElement("canvas"); canvas.width = 1800; canvas.height = 600;
    const ctx = canvas.getContext("2d")!; if (!transparent) { ctx.fillStyle = "#F8F6F0"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    ctx.fillStyle = "#2C1810"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "140px 'Noto Sans Tagalog', sans-serif";
    ctx.fillText(script, canvas.width / 2, canvas.height / 2, 1650);
    canvas.toBlob((blob) => blob && saveBlob(blob, "baybayin-translation.png"), "image/png");
  }
  function saveBlob(blob: Blob, name: string) { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); URL.revokeObjectURL(a.href); }
  async function share() {
    const url = `${location.origin}${location.pathname}?text=${encodeURIComponent(text)}`;
    if (navigator.share) await navigator.share({ title: "My Baybayin translation", text: script, url }); else { await navigator.clipboard.writeText(url); notify("Share link copied!"); }
  }

  return (
    <div className={`translator-card ${compact ? "translator-compact" : ""}`}>
      <div className="translator-topbar">
        <div className="tabs" role="tablist" aria-label="Translation language">
          {[["en", "English → Baybayin"], ["tl", "Tagalog → Baybayin"], ["auto", "Auto detect"]].map(([value, label]) => (
            <button key={value} className={mode === value ? "active" : ""} onClick={() => setMode(value)} role="tab" aria-selected={mode === value}>{label}</button>
          ))}
        </div>
        <span className="local-badge"><i /> Works offline</span>
      </div>
      <div className="translator-grid">
        <label className="input-pane">
          <span className="pane-label">Your text <small>{text.length}/500</small></span>
          <textarea maxLength={500} value={text} onChange={(event) => setText(event.target.value)} placeholder="Type anything... your name, a phrase, a tattoo idea" />
          <span className="detected">Detected: {language}</span>
        </label>
        <div className={`output-pane font-${font}`} ref={areaRef}>
          <div className="pane-label">Baybayin <label>Style <select value={font} onChange={(event) => setFont(event.target.value)}><option value="noto">Classic</option><option value="bloc">Block</option><option value="pnt">Handwritten</option></select></label></div>
          <div className="baybayin-output" aria-live="polite">{units.map((unit, index) => <span key={`${unit.latin}-${index}`} style={{ animationDelay: `${index * 30}ms` }} data-latin={unit.latin}>{unit.script}</span>)}</div>
          <div className="latin-guide">{units.map((unit, index) => <span key={index}>{unit.latin}</span>)}</div>
        </div>
      </div>
      <div className="action-row">
        <button onClick={copy}>▣ <span>Copy Baybayin</span></button>
        <button onClick={downloadPng}>↓ <span>PNG</span></button>
        <button onClick={downloadSvg}>↙ <span>SVG</span></button>
        <button onClick={share}>↗ <span>Share</span></button>
        <label className="transparent-toggle"><input type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} /> Transparent</label>
        {tattooLink && <a className="tattoo-action" href={`/tattoo?text=${encodeURIComponent(text)}`}>See as tattoo →</a>}
      </div>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
