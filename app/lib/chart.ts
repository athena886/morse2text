import { LETTERS, NUMBERS } from "./morse";

export function chartSvg() {
  const cells = [...LETTERS, ...NUMBERS].map(([letter, code], i) => {
    const x = 48 + (i % 6) * 186;
    const y = 154 + Math.floor(i / 6) * 94;
    return `<g><rect x="${x}" y="${y}" width="174" height="82" rx="8" fill="#f5f6f8" stroke="#d6dae3"/><text x="${x + 87}" y="${y + 31}" text-anchor="middle" font-size="25" font-weight="700">${letter}</text><text x="${x + 87}" y="${y + 62}" text-anchor="middle" font-family="monospace" font-size="22" letter-spacing="2">${code}</text></g>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="820" viewBox="0 0 1200 820" role="img" aria-labelledby="title desc"><title id="title">International Morse Code Alphabet</title><desc id="desc">Letters A to Z and numbers 0 to 9. A dot lasts one unit, a dash three units. Gaps: one within a character, three between letters, seven between words.</desc><rect width="1200" height="820" fill="white"/><g font-family="Arial, sans-serif" fill="#152035"><text x="48" y="70" font-size="40" font-weight="700">Morse Code Alphabet</text><text x="48" y="112" font-size="20">Letters A–Z and numbers 0–9 · International Morse code</text>${cells}<text x="48" y="755" font-size="18">Dot 1 · Dash 3 · Inside a letter 1 · Between letters 3 · Between words 7</text><text x="48" y="789" font-size="16">morse2text.com/morse-code-alphabet/ · Free reference chart</text></g></svg>`;
}
