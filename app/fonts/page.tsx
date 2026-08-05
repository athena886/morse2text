import type { Metadata } from "next";
import { Footer, Header } from "../components/SiteChrome";

export const metadata: Metadata = {
  title: "Free Baybayin Fonts for Writing & Design | BaybayinTranslate.com",
  description:
    "Compare Unicode Baybayin fonts for documents, tattoos, logos, and learning. Understand installation, licensing, readability, and export workflows.",
};

const fonts = [
  {
    name: "Noto Sans Tagalog",
    className: "font-noto",
    use: "Learning, interfaces, documents",
    copy: "A clean Unicode foundation with clear vowel marks, dependable screen rendering, and an open license suitable for many personal and commercial projects.",
    href: "https://fonts.google.com/noto/specimen/Noto+Sans+Tagalog",
  },
  {
    name: "Baybayin Bloc",
    className: "font-bloc",
    use: "Posters and display lettering",
    copy: "A strong display treatment for headlines, apparel, and identity work. Test marked characters carefully and confirm the publisher’s current license before production.",
    href: "https://www.dafont.com/theme.php?cat=705",
  },
  {
    name: "Baybayin PNT",
    className: "font-pnt",
    use: "Handwritten concepts",
    copy: "A softer pen-inspired voice for personal studies and decorative drafts. Keep a plain Unicode proof beside any stylized composition so every kudlit stays verifiable.",
    href: "https://www.behance.net/search/projects/baybayin%20font",
  },
];

export default function Fonts() {
  return (
    <>
      <Header />
      <main className="inner-page">
        <section className="page-hero">
          <p className="eyebrow">Type heritage beautifully</p>
          <h1>Baybayin Fonts for Writing &amp; Design</h1>
          <p>
            Compare readable, decorative, and handwritten approaches—then choose a
            typeface that preserves both the voice and the vowel marks of your text.
          </p>
        </section>

        <section className="font-showcase" aria-label="Baybayin font comparison">
          {fonts.map((font) => (
            <article key={font.name} className={font.className}>
              <div>
                <span>ᜋᜑᜎ᜔ ᜃᜒᜆ</span>
                <small>Mahal kita</small>
              </div>
              <p className="eyebrow">{font.use}</p>
              <h2>{font.name}</h2>
              <p>{font.copy}</p>
              <a href={font.href} rel="noreferrer">
                View source &amp; license ↗
              </a>
            </article>
          ))}
        </section>

        <article className="article-body">
          <p className="eyebrow">Choose with confidence</p>
          <h2>What a Baybayin font can—and cannot—do</h2>
          <p>
            A font changes the appearance of encoded text; it does not translate a
            language. Convert and verify the phrase first, using the way it is spoken
            rather than copying Latin letters one by one. Baybayin consonants include
            an inherent <em>a</em> vowel, while kudlit marks change that vowel and
            cancellation marks can show a final consonant. If the transcription is
            wrong, changing typefaces will only make the same mistake look different.
          </p>
          <p>
            Prefer fonts that use the Unicode Tagalog block. Unicode text remains
            searchable, selectable, and portable when another compatible font is
            substituted. Some older downloads place Baybayin drawings on ordinary
            Latin keys; those files may display correctly on one computer but turn
            back into unrelated Latin letters when copied, indexed, or opened without
            the font. Test the underlying text before building a long-term project
            around it.
          </p>

          <h2>Match the font to the job</h2>
          <h3>For learning and body text</h3>
          <p>
            Choose open, uncomplicated forms with generous spacing. The difference
            between an upper and lower vowel mark must remain obvious on a phone and
            in print. Noto Sans Tagalog is a practical baseline because it prioritizes
            consistency over decoration. Use it for worksheets, pronunciation guides,
            captions, and the plain reference supplied beside finished artwork.
          </p>
          <h3>For posters, logos, and merchandise</h3>
          <p>
            Display lettering can carry heavier strokes, sharper geometry, or a more
            personal rhythm. Test the actual phrase, not only the unmarked characters
            shown in a specimen. Reduce the design to its final size and ask a reader
            to sound it out. If texture closes a bowl or absorbs a kudlit, simplify
            the treatment before production.
          </p>
          <h3>For tattoo references</h3>
          <p>
            Small marks need enough weight and space to survive the scale of the
            design. Give the artist a clean black reference, the Latin phrase,
            pronunciation, translation, and verified Unicode text. A decorative font
            can inspire the final lettering, but it should not be the only evidence of
            what the tattoo is intended to say.
          </p>

          <h2>Check the license before downloading</h2>
          <p>
            “Free” can mean free for personal study, free with attribution, or free
            under an open license that also permits commercial use and modification.
            Read the license distributed by the original publisher rather than relying
            on a repost or preview image. Look specifically for permission covering
            logos, merchandise, web embedding, apps, client work, and redistribution.
            Save a copy of the license with the project because download pages and
            terms can change.
          </p>
          <p>
            Noto fonts are released under the SIL Open Font License, but every other
            font must be checked independently. A portfolio page or font directory is
            a discovery point, not proof of usage rights. When ownership or permission
            is unclear, contact the designer or select a documented open alternative.
          </p>

          <h2>Install, test, and export without surprises</h2>
          <p>
            Download from the original publisher, scan the included documentation,
            and install the OTF or TTF file through your operating system’s font
            manager. Restart the design application if the new face does not appear.
            Type a short test containing an independent vowel, marked consonants, nga,
            and a final consonant. Check the same line in the browser, design file, and
            exported PDF before committing to a full layout.
          </p>
          <p>
            When sharing editable files, include the font only when its license permits
            redistribution. Otherwise send the official download link. Preserve one
            live-text master and make an outlined copy only for final production; once
            text is converted to shapes, spelling corrections and accessibility become
            harder. Include a PDF proof so collaborators can see the intended vowel
            marks even if their device substitutes another font.
          </p>

          <h2>A five-point font check</h2>
          <p>
            Confirm that the file uses real Unicode characters, every kudlit is visible
            at final size, the final-consonant convention matches your transcription,
            the license covers the intended use, and the exported result matches the
            editable original. Then ask another reader to verify the finished phrase.
            Typography should strengthen a correct transcription—not hide uncertainty
            behind style.
          </p>

          <div className="inline-links">
            <a href="/#translator">Translate a phrase →</a>
            <a href="/learn/modern-baybayin">Understand Unicode fonts →</a>
            <a href="/learn/calligraphy-beginners">Practice Baybayin lettering →</a>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
