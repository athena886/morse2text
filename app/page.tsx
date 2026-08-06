import MorseTool from "./components/MorseTool";

const faq = [
  ["What is Morse code?", "Morse code is a communication system that represents letters, numbers, and punctuation with short and long signals called dots and dashes. It can be sent as sound, light, radio, or physical pulses."],
  ["How do I translate Morse code to text?", "Paste dots and dashes into the translator. Separate letters with spaces and words with a slash. The tool detects Morse automatically and converts it to readable text as you type."],
  ["Can I listen to Morse code?", "Yes. Select a speed and tone, then press Play signal. The generator uses your browser's audio engine to play accurate dot, dash, letter, and word timing."],
  ["Is this Morse code generator free?", "Yes. Every feature is free, works without an account, and runs locally in your browser."],
  ["Can I download Morse code audio?", "Yes. Enter text, generate its Morse code, and choose Download WAV to save a high-quality audio file that works in common editors and players."],
  ["What do spaces and slashes mean in Morse code?", "A space separates individual letters. A slash separates words. For example, SOS HELP becomes ... --- ... / .... . .-.. .--."],
  ["Does the translator work on mobile?", "Yes. The layout is touch-friendly, audio works on modern mobile browsers, and supported phones can also vibrate the Morse pattern."],
];

const alphabet = [
  ["A",".-"],["B","-..."],["C","-.-."],["D","-.."],["E","."],["F","..-."],["G","--."],["H","...."],["I",".."],["J",".---"],["K","-.-"],["L",".-.."],["M","--"],
  ["N","-."],["O","---"],["P",".--."],["Q","--.-"],["R",".-."],["S","..."],["T","-"],["U","..-"],["V","...-"],["W",".--"],["X","-..-"],["Y","-.--"],["Z","--.."],
  ["0","-----"],["1",".----"],["2","..---"],["3","...--"],["4","....-"],["5","....."],["6","-...."],["7","--..."],["8","---.."],["9","----."],
];

const appSchema = {"@context":"https://schema.org","@type":"WebApplication",name:"Morse Code Translator & Generator",url:"https://morse2text.com/",description:"Free online Morse Code Translator & Generator. Convert text to Morse code and Morse code to text instantly.",applicationCategory:"Utility",operatingSystem:"All",browserRequirements:"Requires JavaScript",offers:{"@type":"Offer",price:"0",priceCurrency:"USD"}};
const faqSchema = {"@context":"https://schema.org","@type":"FAQPage",mainEntity:faq.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))};

export default function Home() {
  return <>
    <header className="site-nav"><a className="logo" href="#top"><span className="logo-signal">·−</span>morse<span>2text</span></a><nav><a href="#how">How it works</a><a href="#alphabet">Alphabet</a><a href="#faq">FAQ</a></nav><a className="nav-button" href="#translator">Start translating</a></header>
    <main id="top">
      <section className="hero">
        <div className="signal-cloud" aria-hidden="true"><span>· · ·</span><span>− − −</span><span>· − ·</span></div>
        <p className="eyebrow"><i/> Instant Morse code translator</p>
        <h1>Morse Code<br/><em>Translator &amp; Generator</em></h1>
        <p className="hero-copy"><strong>Say anything. Send it in Morse.</strong> Type text or Morse code below—the direction is detected automatically.</p>
        <div className="trust-row"><span>↔ Instant translation</span><span>◉ Real Morse audio</span><span>↓ WAV download</span></div>
      </section>
      <section id="translator" className="tool-wrap"><MorseTool/></section>
      <section className="example-strip" aria-label="Popular Morse code examples"><p>Popular signals</p>{[["SOS","... --- ..."],["LOVE",".-.. --- ...- ."],["HELLO",".... . .-.. .-.. ---"],["HELP",".... . .-.. .--."]].map(([a,b])=><button key={a} data-example={a}><b>{a}</b><code>{b}</code></button>)}</section>
      <section className="feature-section"><div className="section-head"><p className="eyebrow">One signal. Every sense.</p><h2>More than a translator.</h2><p>Most tools stop at dots and dashes. morse2text turns your message into a signal you can use.</p></div><div className="feature-grid">
        <article><span>01</span><div className="feature-icon sound-bars"><i/><i/><i/><i/><i/></div><h3>Hear every signal</h3><p>Accurate Web Audio playback with adjustable speed and tone frequency.</p></article>
        <article><span>02</span><div className="feature-icon beacon"><i/></div><h3>See it flash</h3><p>A synchronized signal lamp turns dots and dashes into visible pulses.</p></article>
        <article><span>03</span><div className="feature-icon download-mark">↓</div><h3>Take it with you</h3><p>Export clean WAV audio for videos, lessons, radio practice, and projects.</p></article>
        <article><span>04</span><div className="feature-icon history-mark">↺</div><h3>Never lose a message</h3><p>Your recent translations stay on your device—not on our servers.</p></article>
      </div></section>
      <section id="how" className="story-section"><div className="story-copy"><p className="eyebrow">A language made of rhythm</p><h2>What is Morse code?</h2><p>Morse code is a character-encoding system built from two simple signals: a short mark called a dot and a longer mark called a dash. Developed in the 1830s alongside the electrical telegraph, it gave operators a practical way to send language across long distances. Letters are made from distinct rhythms—A is <code>.-</code>, N is <code>-.</code>, and the famous SOS distress signal is <code>... --- ...</code>.</p><p>Because a Morse signal can travel through sound, light, radio, or touch, it remains remarkably useful. Amateur radio operators use it on crowded frequencies, pilots and navigators recognize beacon identifiers, and learners enjoy its compact musical logic. This <strong>Morse code translator</strong> keeps that logic visible while making it instantly accessible on any modern device.</p></div><div className="story-signal" aria-label="SOS in Morse code"><span>· · ·</span><span>— — —</span><span>· · ·</span><small>S O S · International distress signal</small></div></section>
      <section className="how-section"><div className="section-head"><p className="eyebrow">Ready in seconds</p><h2>How to use the translator</h2></div><div className="steps"><article><b>1</b><h3>Type or paste</h3><p>Enter normal text, or paste Morse using dots, dashes, spaces, and slashes.</p></article><article><b>2</b><h3>Let it detect</h3><p>The translator recognizes the format and converts in the correct direction instantly.</p></article><article><b>3</b><h3>Play, copy, or save</h3><p>Listen to the rhythm, flash or vibrate it, copy the result, or download a WAV.</p></article></div><p className="long-copy">For text-to-Morse conversion, letters are separated by spaces and words by a slash, so the output stays easy to read and share. For Morse-to-text conversion, follow that same format: write <code>.... ..</code> for “HI” and <code>.... .. / - .... . .-. .</code> for “HI THERE.” Unknown patterns are marked clearly instead of silently disappearing. The <strong>Morse code generator</strong> runs entirely in your browser, meaning your messages are not uploaded to a server. Playback uses standard timing: a dash lasts three dot units, with measured gaps between parts of a character, letters, and words. Adjust words per minute to slow down for learning or speed up for realistic practice.</p></section>
      <section id="alphabet" className="alphabet-section"><div className="alphabet-intro"><p className="eyebrow">Learn the code</p><h2>Morse code alphabet</h2><p>Tap or click any character to copy its code. Start with common letters like E, T, A, N, I, and M—the shortest patterns are the easiest to learn.</p></div><div className="alphabet-grid">{alphabet.map(([char,code])=><button key={char} title={`Copy ${char} in Morse code`}><b>{char}</b><code>{code}</code></button>)}</div></section>
      <section id="faq" className="faq-section"><div className="section-head"><p className="eyebrow">Signal clarity</p><h2>Frequently asked questions</h2></div><div className="faq-list">{faq.map(([q,a],i)=><details key={q} open={i===0}><summary><span>{String(i+1).padStart(2,"0")}</span>{q}<b>+</b></summary><p>{a}</p></details>)}</div></section>
      <section className="next-section"><p className="eyebrow">Keep exploring</p><h2>Learn Morse, one signal at a time.</h2><div><a href="/morse-code-alphabet"><b>Morse code alphabet</b><span>Full reference and printable chart →</span></a><a href="/learn-morse-code"><b>Learn Morse code</b><span>Techniques, drills, and practice →</span></a></div></section>
    </main>
    <footer><a className="logo" href="#top"><span className="logo-signal">·−</span>morse<span>2text</span></a><p>Free tools for clear signals.</p><span>© 2026 morse2text.com</span></footer>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(appSchema)}}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema)}}/>
  </>;
}
