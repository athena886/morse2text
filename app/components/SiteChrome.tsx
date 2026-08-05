import Link from "next/link";

export function Header() {
  return <header className="site-header"><Link className="brand" href="/"><span className="brand-mark">ᜊ</span><span>Baybayin<span>Translate</span></span></Link><nav><Link href="/">Translator</Link><Link href="/tattoo">Tattoo</Link><Link href="/learn">Learn</Link><Link href="/fonts">Fonts</Link></nav><a className="nav-cta" href="/#translator">Translate now</a></header>;
}

export function Footer() {
  return <footer><div className="footer-grid"><div><a className="brand footer-brand" href="/"><span className="brand-mark">ᜊ</span><span>Baybayin<span>Translate</span></span></a><p>A free, privacy-friendly tool for writing, learning, and celebrating the precolonial script of the Philippines.</p></div><div><h3>Tools</h3><a href="/#translator">Translator</a><a href="/tattoo">Tattoo generator</a><a href="/fonts">Baybayin fonts</a></div><div><h3>Learn</h3><a href="/learn/baybayin-history">History of Baybayin</a><a href="/learn/baybayin-vs-alibata">Baybayin vs Alibata</a><a href="/learn/write-your-name">Write your name</a></div><div><h3>Scripts</h3><a href="/sulat/badlit">Badlit</a><a href="/sulat/kulitan">Kulitan</a><a href="/sulat/hanunoo">Hanunoo</a><a href="/sulat/tagbanwa">Tagbanwa</a></div></div><div className="footer-bottom"><span>© 2026 BaybayinTranslate.com</span><span>Made with ♥ for Filipino heritage</span></div></footer>;
}
