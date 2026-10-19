import { encodeWav } from "./morse";
import type { Sequence } from "./morse";

self.onmessage = (event: MessageEvent<{ sequence: Sequence; frequency: number }>) => {
  try {
    const buffer = encodeWav(event.data.sequence, event.data.frequency);
    self.postMessage({ buffer }, { transfer: [buffer] });
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : "Unable to generate audio." });
  }
};
