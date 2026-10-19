"use client";
import { useEffect, useRef, useState } from "react";
import { MORSE } from "../lib/morse";
import { beginSession, clearPractice, createDeck, DEFAULT_SETTINGS, loadPractice, nextQuestion, reviewDeck, savePractice, score, SETS, submitAnswer, validateAnswer } from "../lib/practice";
import type { Attempt, CharacterSet, Record as PracticeRecord, Session, Settings } from "../lib/practice";
import { useSignal } from "./useSignal";

export default function MorsePractice() {
  const [settings, setSettings] = useState<Settings>({ ...DEFAULT_SETTINGS });
  const [session, setSession] = useState<Session | null>(null);
  const [original, setOriginal] = useState<Attempt[] | null>(null);
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [answer, setAnswer] = useState("");
  const [heard, setHeard] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [audioError, setAudioError] = useState("");
  const [storageNotice, setStorageNotice] = useState("");
  const [notice, setNotice] = useState("");
  const [loaded, setLoaded] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const current = useRef<Session | null>(null);
  const generation = useRef(0);
  const recordId = useRef("");
  const savedIds = useRef(new Set<string>());
  const { active, play, stop } = useSignal();
  const running = !!session && session.phase !== "complete";
  const totals = score(session?.attempts || [], session?.deck.length || 10);
  const last = session?.attempts.at(-1);

  useEffect(() => {
    try {
      const saved = loadPractice(localStorage);
      setSettings(saved.settings); setRecords(saved.records);
    } catch { setStorageNotice("Browser storage is unavailable. You can still complete a session."); }
    setLoaded(true);
    return () => { generation.current++; };
  }, []);
  useEffect(() => {
    if (session?.phase === "question") input.current?.focus();
    else if (session?.phase === "feedback") nextButton.current?.focus();
    else if (session?.phase === "complete") resultHeading.current?.focus();
  }, [session?.phase, session?.index]);

  const persist = (nextSettings: Settings, nextRecords: PracticeRecord[]) => {
    try {
      if (!savePractice(localStorage, nextSettings, nextRecords)) setStorageNotice("Progress is available for this visit only because browser storage is unavailable.");
    } catch { setStorageNotice("Progress is available for this visit only because browser storage is unavailable."); }
  };
  const update = (value: Session | null) => { current.current = value; setSession(value); };
  const cancelAudio = () => { generation.current++; stop(); setPending(false); };
  const listen = async (character: string, reveal = false) => {
    const ticket = ++generation.current;
    setAudioError(""); setPending(true);
    try {
      const started = await play(MORSE[character], settings.speed, 700, "audio", settings.volume / 100);
      if (generation.current === ticket && started) { if (!reveal) setHeard(true); }
    } catch {
      if (generation.current === ticket) setAudioError("Audio could not start. Check your volume and browser audio settings, then choose Replay signal. You can also end this session and try another browser.");
    } finally { if (generation.current === ticket) setPending(false); }
  };
  const start = (review = false) => {
    if (current.current && current.current.phase !== "complete") return;
    cancelAudio(); setAnswer(""); setError(""); setAudioError(""); setNotice(""); setHeard(false);
    const source = current.current;
    const deck = review && source ? reviewDeck(source.attempts) : createDeck(settings.set);
    if (!deck.length) return;
    if (!review) { setOriginal(null); recordId.current = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`; }
    else if (source?.kind === "session") setOriginal(source.attempts);
    const next = beginSession(deck, review ? "review" : "session"); update(next);
    void listen(next.deck[0]);
  };
  const submit = (skip = false) => {
    const value = current.current;
    if (!value || value.phase !== "question") return;
    if (!skip) {
      const validation = validateAnswer(answer);
      if (validation.error) { setError(validation.error); input.current?.focus(); return; }
      if (!heard) { setError("Listen to the signal before checking. Use Replay signal if audio was interrupted."); return; }
    }
    cancelAudio(); setError(""); setAudioError("");
    update(submitAnswer(value, skip ? null : answer));
  };
  const advance = () => {
    const value = current.current;
    if (!value || value.phase !== "feedback") return;
    cancelAudio(); setError(""); setAudioError(""); setAnswer(""); setHeard(false);
    const next = nextQuestion(value); update(next);
    if (next.phase === "complete") {
      if (next.kind === "session" && !savedIds.current.has(recordId.current)) {
        savedIds.current.add(recordId.current);
        const record: PracticeRecord = { id: recordId.current, finishedAt: new Date().toISOString(), settings: { ...settings }, attempts: next.attempts };
        const nextRecords = [record, ...records].slice(0, 5); setRecords(nextRecords); persist(settings, nextRecords);
      }
    } else void listen(next.deck[next.index]);
  };
  const end = () => {
    cancelAudio(); update(null); setOriginal(null); setAnswer(""); setHeard(false); setError(""); setAudioError("");
    setNotice("Session ended. Unfinished sessions are not saved or included in your recent results.");
  };
  const changeSettings = (next: Settings) => {
    if (next.set !== settings.set && current.current?.phase === "complete") {
      cancelAudio(); update(null); setOriginal(null); setNotice("New character set selected. Start when you are ready.");
    }
    setSettings(next); persist(next, records);
  };
  const clear = () => {
    cancelAudio(); update(null); setOriginal(null); setRecords([]); setSettings({ ...DEFAULT_SETTINGS });
    setAnswer(""); setError(""); setAudioError(""); setStorageNotice("");
    try { if (!clearPractice(localStorage)) setStorageNotice("Saved browser data could not be removed because storage is blocked. This visit has been reset."); }
    catch { setStorageNotice("Saved browser data could not be removed because storage is blocked. This visit has been reset."); }
    setNotice("Practice settings and recent results cleared. Defaults restored.");
  };
  return <section id="practice-tool" className="practice-tool" aria-label="Morse listening quiz">
    <div className="practice-top"><span><i className="live-dot" /> LISTEN · RECOGNIZE · REPEAT</span><span>10 questions · No timer</span></div>
    <div className="practice-layout">
      <div className="practice-stage">
        {!session && <div className="practice-welcome"><span className="practice-symbol" aria-hidden="true">· −</span><h2>Make the sound familiar.</h2><p>Listen to one character, type what you hear, and check your answer. Start with six short letters or choose a bigger set.</p><button className="practice-primary" disabled={!loaded} onClick={() => start()}>Start 10-question session</button><p className="practice-small">Audio starts when you press Start. Use a comfortable volume.</p><a href="#practice-settings">Choose character set &amp; speed ↓</a></div>}
        {session && session.phase !== "complete" && <>
          <div className="practice-question-top"><span>{session.kind === "review" ? "Mistake review" : "Listening session"}</span><b>Question {session.index + 1} of {session.deck.length}</b></div>
          <progress aria-label="Questions resolved" max={session.deck.length} value={session.attempts.length} />
          <div className="practice-live" role="status">{pending ? "Starting audio…" : active ? "Playing signal…" : session.phase === "feedback" ? "Answer checked. Continue when you are ready." : heard ? "Your turn. Type the character you heard." : "Replay the signal to begin listening."}</div>
          <div className={`practice-listen ${active ? "playing" : ""}`} aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
          <div className="practice-playback"><button onClick={() => void listen(session.deck[session.index], session.phase === "feedback")} disabled={pending}>↻ Replay signal</button><button onClick={cancelAudio} disabled={!active && !pending}>■ Stop audio</button></div>
          <form className="practice-answer-form" onSubmit={e => { e.preventDefault(); submit(); }} noValidate>
            <label htmlFor="practice-answer">Which character did you hear?</label>
            <div><input ref={input} id="practice-answer" type="text" inputMode={settings.set === "numbers" ? "numeric" : "text"} autoComplete="off" autoCorrect="off" autoCapitalize="characters" spellCheck={false} value={answer} onChange={e => { setAnswer(e.target.value); setError(""); }} aria-invalid={!!error} aria-describedby="practice-answer-help practice-input-error" disabled={session.phase !== "question"} /><button type="submit" className="practice-primary" disabled={session.phase !== "question" || !heard || pending}>Check answer</button></div>
            <p id="practice-answer-help" className="practice-small">One letter or number. Press Enter to check; lowercase is accepted.</p>
            <p id="practice-input-error" className="practice-input-error" role="alert">{error}</p>
          </form>
          <div className="practice-feedback" aria-live="polite" aria-atomic="true">
            {session.phase === "feedback" && last ? <div className={`answer-feedback ${last.outcome}`}><strong>{last.outcome === "correct" ? "✓ Correct" : last.outcome === "skipped" ? "↷ Skipped" : "× Not quite"}</strong><p>Target: <b>{last.target}</b> <code>{MORSE[last.target]}</code>{last.outcome === "incorrect" && <><br />Your answer: <b>{last.answer}</b> <code>{MORSE[last.answer!]}</code></>}</p><p>{last.outcome === "correct" ? "Keep recognizing the whole rhythm." : "Replay the target sound, then try it again in mistake review."}</p>{last.outcome === "incorrect" && <button onClick={() => void listen(last.answer!, true)}>Compare your answer ({last.answer})</button>}</div> : <p className="practice-small">The answer stays hidden until you check or skip.</p>}
          </div>
          <div className="practice-question-actions">{session.phase === "feedback" ? <button ref={nextButton} className="practice-primary" onClick={advance}>{session.index === session.deck.length - 1 ? "See results" : "Next question →"}</button> : <button onClick={() => submit(true)}>Skip & reveal</button>}<button className="practice-quiet" onClick={end}>End session</button></div>
        </>}
        {session?.phase === "complete" && <div className="practice-results">
          <p className="eyebrow">{session.kind === "review" ? "Review complete" : "Session complete"}</p><h2 ref={resultHeading} tabIndex={-1}>{totals.correct} / {totals.total} correct · {totals.percent}%</h2><p>{totals.incorrect} incorrect · {totals.skipped} skipped. {session.kind === "review" ? "This is your review score; your original session stays unchanged." : "Your first answer to each of the 10 questions counts. Skips stay in the total."}</p>
          {original && <p className="practice-original">Original session: <b>{score(original).correct} / {original.length} correct</b> · {score(original).percent}%</p>}
          <h3>{reviewDeck(session.attempts).length ? "Give these sounds another listen" : "Every sound recognized"}</h3><p>{reviewDeck(session.attempts).length ? "Review includes each missed or skipped character once, even if it appeared more than once." : "No mistakes to review. Try a wider character set or a new session."}</p>
          <div className="practice-result-actions">{!!reviewDeck(session.attempts).length && <button className="practice-primary" onClick={() => start(true)}>Review mistakes ({reviewDeck(session.attempts).length})</button>}<button onClick={() => start()}>Start a new session</button></div>
          <details open><summary>Question-by-question results</summary><ol className="practice-attempts">{session.attempts.map((attempt, i) => <li key={i}><span>{i + 1}. <b>{attempt.target}</b> <code>{MORSE[attempt.target]}</code></span><span>{attempt.outcome === "correct" ? "Correct" : attempt.outcome === "skipped" ? "Skipped" : `Entered ${attempt.answer}`}</span></li>)}</ol></details>
        </div>}
        {audioError && <p role="alert" className="practice-audio-error">{audioError}</p>}
        {notice && <p className="practice-notice" role="status">{notice}</p>}
      </div>
      <aside id="practice-settings" className="practice-settings" aria-label="Practice settings">
        <p className="eyebrow">Your session</p><fieldset disabled={running || !loaded}><legend>Choose your sounds</legend><label htmlFor="practice-set">Character set</label><select id="practice-set" value={settings.set} onChange={e => changeSettings({ ...settings, set: e.target.value as CharacterSet })}>{Object.entries(SETS).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select><p className="practice-pool">{Array.from(SETS[settings.set].characters).join(" · ")}</p><label htmlFor="practice-speed">Character speed <b>{settings.speed} WPM</b></label><input id="practice-speed" type="range" min="8" max="35" value={settings.speed} onChange={e => changeSettings({ ...settings, speed: +e.target.value })} /><label htmlFor="practice-volume">Volume <b>{settings.volume}%</b></label><input id="practice-volume" type="range" min="10" max="100" step="10" value={settings.volume} onChange={e => changeSettings({ ...settings, volume: +e.target.value })} /></fieldset><p className="practice-small">{running ? "End or finish this session to change settings." : "700 Hz tone. Speed changes each character’s rhythm; you choose when the next question starts."}</p>
        {!session && <button className="practice-primary practice-side-start" disabled={!loaded} onClick={() => start()}>Start with these settings</button>}
        <div className="practice-score"><span>{session?.kind === "review" ? "This review" : "First answers"}</span><strong>{totals.correct}<small> / {totals.total}</small></strong><p>{session?.attempts.length || 0} resolved · {totals.skipped} skipped</p></div>
        <div className="practice-history"><h3>Recent sessions</h3><p className="practice-small">Last five completed sessions, on this browser only. Reviews do not replace these scores.</p>{records.length ? <ol>{records.map(r => <li key={r.id}><span>{SETS[r.settings.set].label}<small>{r.settings.speed} WPM · {new Date(r.finishedAt).toLocaleDateString("en", { month: "short", day: "numeric" })}</small></span><b>{score(r.attempts).correct}/10</b></li>)}</ol> : <p className="practice-small">Finish a session to see your first result here.</p>}<button className="practice-quiet" onClick={clear} disabled={running || !loaded}>Clear practice data</button></div>
        {storageNotice && <p className="practice-small" role="status">{storageNotice}</p>}
      </aside>
    </div>
  </section>;
}
