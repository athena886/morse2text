import type {Metadata} from "next";
import {MorseFooter,MorseHeader,TranslatorCta} from "../components/MorseChrome";

export const metadata:Metadata={
  title:"Morse Code Alphabet — Letters, Numbers & Chart | morse2text",
  description:"Learn the complete Morse code alphabet with letters A–Z, numbers 0–9, common punctuation, timing rules, and practical memorization tips.",
  alternates:{canonical:"/morse-code-alphabet/"},
  openGraph:{title:"Morse Code Alphabet & Reference Chart",description:"The complete International Morse code chart with practical learning tips.",url:"/morse-code-alphabet/"}
};

const letters=[["A",".-"],["B","-..."],["C","-.-."],["D","-.."],["E","."],["F","..-."],["G","--."],["H","...."],["I",".."],["J",".---"],["K","-.-"],["L",".-.."],["M","--"],["N","-."],["O","---"],["P",".--."],["Q","--.-"],["R",".-."],["S","..."],["T","-"],["U","..-"],["V","...-"],["W",".--"],["X","-..-"],["Y","-.--"],["Z","--.."]];
const numbers=[["0","-----"],["1",".----"],["2","..---"],["3","...--"],["4","....-"],["5","....."],["6","-...."],["7","--..."],["8","---.."],["9","----."]];
const punctuation=[["Period",".-.-.-"],["Comma","--..--"],["Question mark","..--.."],["Apostrophe",".----."],["Exclamation","-.-.--"],["Slash","-..-."],["Parentheses","-.--. / -.--.-"],["At sign",".--.-."]];

function CodeGrid({items,label}:{items:string[][];label:string}){return <div className="reference-grid" aria-label={label}>{items.map(([char,code])=><div key={char}><b>{char}</b><code>{code}</code></div>)}</div>}

export default function MorseAlphabetPage(){return <>
  <MorseHeader/>
  <main className="guide-page">
    <section className="guide-hero"><p className="eyebrow"><i/> Complete reference chart</p><h1>Morse Code Alphabet</h1><p>Learn every International Morse code letter and number, then practice reading signals as rhythm instead of counting individual dots and dashes.</p><div className="guide-actions"><a className="primary" href="/#translator">Use the translator</a><a href="/learn-morse-code/">Start learning Morse →</a></div></section>
    <section className="guide-body">
      <div className="guide-lead"><div><p className="eyebrow">A–Z reference</p><h2>Letters in Morse code</h2></div><p>Each letter is represented by a short sequence of dots and dashes. A dot is one time unit and a dash is three. Begin with the shortest patterns—E (<code>.</code>), T (<code>-</code>), I (<code>..</code>), A (<code>.-</code>), N (<code>-.</code>), and M (<code>--</code>)—before adding longer characters.</p></div>
      <CodeGrid items={letters} label="Morse code letters A through Z"/>
      <div className="guide-lead section-space"><div><p className="eyebrow">0–9 reference</p><h2>Numbers in Morse code</h2></div><p>Numbers always use five signals. The pattern grows from five dashes for zero to five dots for five, then reverses back toward dashes. That symmetry makes the number set easier to memorize than it first appears.</p></div>
      <CodeGrid items={numbers} label="Morse code numbers zero through nine"/>
      <div className="guide-split section-space"><article><p className="eyebrow">Signal spacing</p><h2>Timing makes Morse readable</h2><p>Morse is a timed language. A dot lasts one unit and a dash lasts three units. Parts of the same character are separated by one unit, letters by three units, and words by seven units. Written Morse normally uses a space between letters and a slash between words.</p><div className="signal-example"><span>HELLO</span><code>.... . .-.. .-.. ---</code></div><div className="signal-example"><span>SOS HELP</span><code>... --- ... / .... . .-.. .--.</code></div></article><article><p className="eyebrow">Common symbols</p><h2>Punctuation</h2><div className="punctuation-list">{punctuation.map(([name,code])=><div key={name}><span>{name}</span><code>{code}</code></div>)}</div></article></div>
      <section className="tip-panel section-space"><p className="eyebrow">Memory shortcut</p><h2>Learn by sound, not by sight</h2><p>Charts are useful for reference, but fluent operators recognize the sound of a whole character. Listen to <code>.-</code> as “di-dah” for A instead of thinking “dot, dash.” Practice in short daily sessions, mix characters you already know with one or two new ones, and avoid tracing a visual decision tree in your head. The goal is to hear a rhythm and recognize it immediately.</p><div className="tip-grid"><div><b>Start small</b><span>Learn six short characters first.</span></div><div><b>Use mixed drills</b><span>Practice random groups, not A–Z order.</span></div><div><b>Stay accurate</b><span>Slow down before errors become habits.</span></div></div></section>
    </section>
    <TranslatorCta title="Put the alphabet to work" copy="Enter any letter, word, or Morse sequence and see the translation instantly."/>
  </main>
  <MorseFooter/>
  </>}
