import type {Metadata} from "next";
import AlphabetReference from "../components/AlphabetReference";
import {Breadcrumbs,MorseFooter,MorseHeader,TranslatorCta} from "../components/MorseChrome";

export const metadata:Metadata={
  title:"Morse Code Alphabet — Letters, Numbers & Chart | morse2text",
  description:"Look up Morse code letters and numbers, hear each character, copy its code, and print or download a free SVG chart. Includes punctuation and timing rules.",
  alternates:{canonical:"/morse-code-alphabet/"},
  openGraph:{title:"Morse Code Alphabet & Reference Chart",description:"The complete International Morse code chart with practical learning tips.",url:"/morse-code-alphabet/",images:[{url:"/og.png",width:1200,height:630,alt:"morse2text Morse code tools"}]}
};

const punctuation=[["Period",".-.-.-"],["Comma","--..--"],["Question mark","..--.."],["Apostrophe",".----."],["Exclamation","-.-.--"],["Slash","-..-."],["Parentheses","-.--. / -.--.-"],["At sign",".--.-."]];

export default function MorseAlphabetPage(){return <>
  <MorseHeader/>
  <main className="guide-page alphabet-page"><Breadcrumbs name="Morse Code Alphabet" path="/morse-code-alphabet/"/>
    <section className="guide-hero"><p className="eyebrow"><i/> Complete reference chart</p><h1>Morse Code Alphabet</h1><p>Look up every International Morse code letter and number. Listen, copy, or take a clean printable chart with you.</p><div className="guide-actions"><a className="primary" href="#reference-chart">Open the chart</a><a href="/learn-morse-code/">Start learning Morse →</a></div></section>
    <section className="guide-body">
      <AlphabetReference/>
      <div className="guide-split section-space"><article><p className="eyebrow">Signal spacing</p><h2>Timing makes Morse readable</h2><p>Morse is a timed language. A dot lasts one unit and a dash lasts three units. Parts of the same character are separated by one unit, letters by three units, and words by seven units. Written Morse normally uses a space between letters and a slash between words.</p><div className="signal-example"><span>HELLO</span><code>.... . .-.. .-.. ---</code></div><div className="signal-example"><span>SOS HELP</span><code>... --- ... / .... . .-.. .--.</code></div></article><article><p className="eyebrow">Common symbols</p><h2>Punctuation</h2><div className="punctuation-list">{punctuation.map(([name,code])=><div key={name}><span>{name}</span><code>{code}</code></div>)}</div></article></div>
      <section className="tip-panel section-space"><p className="eyebrow">Memory shortcut</p><h2>Learn by sound, not by sight</h2><p>Charts are useful for reference, but fluent operators recognize the sound of a whole character. Listen to <code>.-</code> as “di-dah” for A instead of thinking “dot, dash.” Practice in short daily sessions, mix characters you already know with one or two new ones, and avoid tracing a visual decision tree in your head. The goal is to hear a rhythm and recognize it immediately.</p><div className="tip-grid"><div><b>Start small</b><span>Learn six short characters first.</span></div><div><b>Use mixed drills</b><span>Practice random groups, not A–Z order.</span></div><div><b>Stay accurate</b><span>Slow down before errors become habits.</span></div></div></section>
    </section>
    <TranslatorCta title="Put the alphabet to work" copy="Enter any letter, word, or Morse sequence and see the translation instantly."/>
  </main>
  <MorseFooter/>
  </>}
