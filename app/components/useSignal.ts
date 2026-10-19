"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { SignalAudio } from "../lib/audio";
import { buildSequence, MAX_SIGNAL_MS, vibrationPattern } from "../lib/morse";

type Kind = "audio" | "flash" | "vibrate";
export function useSignal() {
  const [active, setActive] = useState<Kind | null>(null);
  const [lit, setLit] = useState(false);
  const audio = useRef<SignalAudio | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const vibrating = useRef(false);
  const run = useRef(0);

  const stop = useCallback(() => {
    run.current++;
    audio.current?.stop();
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (vibrating.current) navigator.vibrate?.(0);
    vibrating.current = false;
    setActive(null);
    setLit(false);
  }, []);

  useEffect(() => {
    const hide = () => { if (document.hidden) stop(); };
    document.addEventListener("visibilitychange", hide);
    return () => { document.removeEventListener("visibilitychange", hide); stop(); };
  }, [stop]);

  const play = useCallback(async (morse: string, speed = 18, frequency = 700, kind: Kind = "audio") => {
    stop();
    const sequence = buildSequence(morse, speed);
    if (!sequence.pulses.length) throw new Error("Enter a valid message first.");
    if (sequence.total > MAX_SIGNAL_MS) throw new Error("Signals are limited to two minutes. Shorten your message or increase the speed.");
    const generation = run.current;
    if (kind === "audio") {
      const Constructor = window.AudioContext || window.webkitAudioContext;
      if (!Constructor) throw new Error("Audio is not available in this browser. You can still copy the Morse code.");
      audio.current ??= new SignalAudio(() => new Constructor());
      setActive(kind);
      try { await audio.current.play(sequence, frequency, () => { if (run.current === generation) stop(); }); }
      catch { if (run.current === generation) stop(); throw new Error("Audio could not start. Try again, or check your browser's audio settings."); }
    } else {
      if (kind === "vibrate") {
        if (!navigator.vibrate || sequence.pulses.length > 128 || sequence.total > 30_000) {
          throw new Error("Vibration needs a supported phone and a short signal (up to 30 seconds / 128 pulses).");
        }
        if (!navigator.vibrate(vibrationPattern(sequence))) throw new Error("Vibration is unavailable or blocked in this browser.");
        vibrating.current = true;
      } else {
        sequence.pulses.forEach(pulse => {
          timers.current.push(setTimeout(() => setLit(true), pulse.start), setTimeout(() => setLit(false), pulse.start + pulse.duration));
        });
      }
      setActive(kind);
      timers.current.push(setTimeout(stop, sequence.total));
    }
  }, [stop]);
  return { active, lit, play, stop };
}

declare global { interface Window { webkitAudioContext?: typeof AudioContext } }
