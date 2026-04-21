import { RequestClient } from "../../request";

export interface SSETranscribeParams {
  language: string;
  vadThreshold: number;
  translate?: boolean;
}

export async function transcribeChunk(
  client: RequestClient,
  wavBuf: Uint8Array,
  params: SSETranscribeParams,
  onDelta: (text: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const searchParams: Record<string, any> = {
    stream: "true",
    vad: "true",
    vad_threshold: params.vadThreshold,
    language: params.language,
    translate: params.translate ? "true" : undefined,
  };

  const resp = await client.fetchJSSStream("/v1/ai/transcribe", "POST", wavBuf, searchParams, { "Content-Type": "audio/wav" }, signal);

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Transcribe failed ${resp.status}: ${text.slice(0, 200)}`);
  }

  if (!resp.body) {
    throw new Error("Transcribe response has no body");
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let finalText = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buf.indexOf("\n")) !== -1) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        let event: any;
        try {
          event = JSON.parse(data);
        } catch {
          continue;
        }
        if (event.type === "transcript.delta" && typeof event.delta === "string") {
          onDelta(event.delta);
        } else if ((event.type === "transcript.done" || event.type === "transcript.final") && typeof event.text === "string") {
          finalText = event.text.trim();
        }
      }
    }
  } finally {
    reader.releaseLock?.();
  }

  return finalText;
}
