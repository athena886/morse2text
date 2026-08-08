import type {Metadata} from "next";
import {MorseFooter,MorseHeader,TranslatorCta} from "../components/MorseChrome";

export const metadata:Metadata={
  title:"Learn Morse Code — Beginner Guide & Practice Plan | morse2text",
  description:"Learn Morse code with a simple beginner method, correct timing, daily drills, and a seven-day practice plan using sound and rhythm.",
  alternates:{canonical:"/learn-morse-code/"},
  openGraph:{title:"How to Learn Morse Code",description:"A practical beginner guide to Morse timing, sound, and daily practice.",url:"/learn-morse-code/"}
};

const plan=[
  ["Day 1","E, T, I, A, N, M","Hear the difference between one- and two-signal characters."],
  ["Day 2","S, U, R, W, D, K, G, O","Add three-signal rhythms and review yesterday’s set."],
  ["Day 3","H, V, F, L, P, J, B, X, C, Y, Z, Q","Complete the alphabet in small mixed groups."],
  ["Day 4","Numbers 0–9","Use the five-signal pattern and its built-in symmetry."],
  ["Day 5","Short words","Copy common words such as THE, RADIO, SIGNAL, and HELP."],
  ["Day 6","Sentences","Practice letter and word spacing at a comfortable speed."],
  ["Day 7","Real listening","Decode a one-minute practice signal without pausing."],
];

export default function LearnMorsePage(){return <>
  <MorseHeader/>
  <main className="guide-page">
    <section className="guide-hero learn-hero"><p className="eyebrow"><i/> Beginner-friendly method</p><h1>Learn Morse Code</h1><p>Build real listening skill with rhythm, correct spacing, and short daily drills. You do not need to memorize the entire chart before you begin.</p><div className="guide-actions"><a className="primary" href="/#translator">Practice with the translator</a><a href="/morse-code-alphabet/">Open alphabet chart →</a></div></section>
    <section className="guide-body">
      <div className="guide-lead"><div><p className="eyebrow">The right foundation</p><h2>Hear characters as complete sounds</h2></div><div><p>The fastest way to learn Morse code is to connect each character with one rhythm. When you hear A, recognize “di-dah” as a single sound rather than translating a dot and a dash separately. Counting symbols feels easier on day one, but it creates an extra mental step that limits your speed later.</p><p>Start at a character speed near 15–20 words per minute while leaving generous gaps between characters. This keeps each pattern sounding natural without overwhelming you. As recognition improves, shorten the gaps instead of speeding up every dot and dash.</p></div></div>
      <section className="timing-card section-space"><div><p className="eyebrow">The universal ratio</p><h2>Morse timing in five rules</h2><p>Choose any comfortable dot length. Every other duration follows from that single unit.</p></div><div className="timing-list"><div><b>1 unit</b><span>Dot</span><code>·</code></div><div><b>3 units</b><span>Dash</span><code>—</code></div><div><b>1 unit</b><span>Gap inside a character</span><code>··</code></div><div><b>3 units</b><span>Gap between letters</span><code>A B</code></div><div><b>7 units</b><span>Gap between words</span><code>A / B</code></div></div></section>
      <div className="guide-lead section-space"><div><p className="eyebrow">A simple routine</p><h2>Seven-day Morse practice plan</h2></div><p>Spend 10–15 focused minutes each day. Accuracy matters more than a high score: if you start guessing, reduce the number of new characters or add more spacing. Review should always be mixed so you learn the sound itself, not its position in a sequence.</p></div>
      <div className="practice-plan">{plan.map(([day,focus,goal])=><article key={day}><span>{day}</span><h3>{focus}</h3><p>{goal}</p></article>)}</div>
      <div className="guide-split section-space"><article><p className="eyebrow">Drill 01</p><h2>Copy random groups</h2><p>Listen to groups of five characters and write what you hear. Random groups remove clues from normal language, forcing direct recognition. Begin with two-character groups if needed, then grow to five. Check your answer only after the group ends.</p><div className="signal-example"><span>Practice set</span><code>K M A R · S U N T · W D E O</code></div></article><article><p className="eyebrow">Drill 02</p><h2>Send meaningful text</h2><p>Type a short message into the translator and play it repeatedly. Follow the printed Morse the first time, then listen with your eyes closed. Names, call signs, weather words, and familiar sentences are memorable material for early sending practice.</p><div className="signal-example"><span>Try this</span><code>MEET ME AT NOON</code></div></article></div>
      <section className="tip-panel section-space"><p className="eyebrow">Avoid these traps</p><h2>Three habits that slow learners down</h2><div className="mistake-grid"><article><b>Counting every dot</b><p>Replace visual counting with whole-character sound recognition.</p></article><article><b>Practicing only in order</b><p>Use random drills so A does not merely remind you that B comes next.</p></article><article><b>Chasing speed too early</b><p>Keep accuracy above roughly nine out of ten before closing the gaps.</p></article></div><p>Progress often feels uneven: several characters may become automatic while two or three remain stubborn. That is normal. Give difficult pairs extra contrast practice—such as U (<code>..-</code>) versus D (<code>-..</code>)—and keep sessions short enough to stay attentive.</p></section>
    </section>
    <TranslatorCta title="Practice your first signal" copy="Use adjustable speed and tone to hear the rhythm, then decode it without leaving the page."/>
  </main>
  <MorseFooter/>
  </>}
