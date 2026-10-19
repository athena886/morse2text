export function MorseHeader(){
  return <header className="guide-nav"><a className="logo" href="/"><span className="logo-signal">·−</span>morse<span>2text</span></a><nav><a href="/#translator">Translator</a><a href="/morse-code-alphabet/">Alphabet</a><a href="/learn-morse-code/">Learn</a></nav><a className="nav-button" href="/#translator">Open translator</a></header>;
}

export function MorseFooter(){
  return <footer><a className="logo" href="/"><span className="logo-signal">·−</span>morse<span>2text</span></a><p>Free tools for clear signals.</p><span>© 2026 morse2text.com</span></footer>;
}

export function TranslatorCta({title="Ready to send a signal?",copy="Turn text into Morse code—or decode Morse back to text—in your browser."}:{title?:string;copy?:string}){
  return <section className="guide-cta"><div><p className="eyebrow">Free · Private · Instant</p><h2>{title}</h2><p>{copy}</p></div><a href="/#translator">Open Morse translator <span>→</span></a></section>;
}

export function Breadcrumbs({ name, path }: { name: string; path: string }) {
  const schema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://morse2text.com/" },
    { "@type": "ListItem", position: 2, name, item: `https://morse2text.com${path}` },
  ] };
  return <><nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">{name}</span></nav><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /></>;
}
