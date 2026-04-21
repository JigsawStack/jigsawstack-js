# JigsawStack AI SDK

The JigsawStack AI SDK is a Typescript/Javascript library that allows you to interact with powerful AI services to build AI-powered applications in any framework like Next.js, React, Vue, Svelte, and more that supports JS.

- 🧩 Powerful AI services all in one SDK
- 🧑‍💻 Native JS/TS SDK
- ▲ Supports Next.js, React, Vue, Svelte, Node.js, Bun, Deno, and more
- ⌨️ Fully typed parameters and responses
- 📡 Built in Webhook support for long-running tasks
- 📦 Built in file system for easy file uploads
- 🍃 Lightweight and blazing fast, built ont native `fetch` with [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch) for maximum compatibility

## Learn more

To learn more about all available JigsawStack AI services, view the [Documentation](https://docs.jigsawstack.com) or [Website](https://jigsawstack.com).

## All APIs

| Category          | APIs                                               |
| ----------------- | -------------------------------------------------- |
| **👉 General**    | Translation, Summarization, Sentiment Analysis     |
| **🌐 Web**        | AI Web Scraping, AI Web Search                     |
| **🎵 Audio**      | Speech to Text                                     |
| **👀 Vision**     | vOCR, Object Detection                             |
| **🖼️ Generative** | AI Image (Flux, SD, SDXL-Fast & more), HTML to Any |
| **✅ Validation** | Email, NSFW images, profanity & more               |

Learn more of about each category in the [API reference](https://jigsawstack.com/docs/api-reference)

## Installation

You will need Node.js 18+ on your local development machine.

```bash
npm install jigsawstack
# or
yarn add jigsawstack
# or
bun add jigsawstack
```

## Setup

First, get your API key from the [JigsawStack Dashboard](https://jigsawstack.com/dashboard)

Then, initialize the SDK:

```ts
import { JigsawStack } from "jigsawstack";

const jigsaw = JigsawStack({ apiKey: "your-api-key" });
```

## Usage

AI Scraping Example:

```ts
const resp = await jigsaw.web.ai_scrape({
  url: "https://www.amazon.com/Cadbury-Mini-Caramel-Eggs-Bulk/dp/B0CWM99G5W",
  element_prompts: ["prices"],
});
```


Upload a file to use across any API example:

```ts
const file =
  /*reference to file blob or buffer*/

  await jigsaw.store.upload(file, {
    filename: "receipt.png",
  });

// Now you can use the file_key in any API call
const ocrResp = await jigsaw.vision.vocr({
  file_store_key: "receipt.png",
});

const objectDetectionResp = await jigsaw.vision.object_detection({
  file_store_key: "receipt.png",
});
```

### Live speech-to-text (streaming)

Pipe real-time PCM16 audio (microphone, WebRTC, file) into the SDK and receive incremental and committed transcripts.

```js
import { Readable } from "stream";
import recorder from "node-record-lpcm16";
import { JigsawStack } from "jigsawstack";

const jigsaw = JigsawStack({ apiKey: process.env.JIGSAWSTACK_API_KEY });
// Streaming is English-only and expects mono 16-bit PCM input (downmix stereo sources beforehand).
const transcriber = jigsaw.audio.speech_to_text_live({
  sampleRate: 16000,
});

transcriber.on("delta", ({ text }) => process.stdout.write(`\r… ${text}`));
transcriber.on("turn",  ({ text }) => console.log(`\n${text}`));

await transcriber.connect();

const rec = recorder.record({ sampleRate: 16000, channels: 1, audioType: "raw" });
Readable.toWeb(rec.stream()).pipeTo(transcriber.stream());

process.on("SIGINT", async () => {
  rec.stop();
  await transcriber.close();
  process.exit();
});
```

See `examples/live-mic.js` for a full working example.

## Community

Join JigsawStack community on [Discord](https://discord.gg/dj8fMBpnqd) to connect with other developers, share ideas, and get help with the SDK.

## Related Projects

- [Docs](https://jigsawstack.com/docs)
- [Python SDK](https://github.com/JigsawStack/jigsawstack-python)

## Contributing

JigsawStack AI SDK is open-source and welcomes contributions. Please open an issue or submit a pull request with your changes. Make sure to be as descriptive as possible with your submissions, include examples if relevant.
