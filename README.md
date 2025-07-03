# Soham AI SDK

The Soham AI SDK is a Typescript/Javascript library that allows you to interact with powerful AI services to build AI-powered applications in any framework like Next.js, React, Vue, Svelte, and more that supports JS.

- 🧩 Powerful AI services all in one SDK
- 🧑‍💻 Native JS/TS SDK
- ▲ Supports Next.js, React, Vue, Svelte, Node.js, Bun, Deno, and more
- ⌨️ Fully typed parameters and responses
- 📡 Built in Webhook support for long-running tasks
- 📦 Built in file system for easy file uploads
- 🍃 Lightweight and blazing fast, built ont native `fetch` with [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch) for maximum compatibility

## Learn more

To learn more about all available Soham AI services, view the [Documentation](https://docs.jigsawstack.com) or [Website](https://jigsawstack.com).

## All APIs

| Category          | APIs                                               |
| ----------------- | -------------------------------------------------- |
| **👉 General**    | Translation, Summarization, Sentiment Analysis     |
| **🌐 Web**        | AI Web Scraping, AI Web Search                     |
| **🎵 Audio**      | Text to Speech, Speech to Text                     |
| **👀 Vision**     | vOCR, Object Detection                             |
| **🧠 LLMs**       | Prompt Engine                                      |
| **🖼️ Generative** | AI Image (Flux, SD, SDXL-Fast & more), HTML to Any |
| **✅ Validation** | Email, NSFW images, profanity & more               |

Learn more of about each category in the [API reference](https://jigsawstack.com/docs/api-reference)

## Installation

You will need Node.js 18+ on your local development machine.

```bash
npm install soham-ai
# or
yarn add soham-ai
# or
bun add soham-ai
```

## Setup

First, get your API key from the [Soham Dashboard](https://jigsawstack.com/dashboard)

Then, initialize the SDK:

```ts
import { Soham } from "soham-ai";

const soham = Soham({ apiKey: "your-api-key" });
```

## Usage

AI Scraping Example:

```ts
const resp = await soham.web.ai_scrape({
  url: "https://www.amazon.com/Cadbury-Mini-Caramel-Eggs-Bulk/dp/B0CWM99G5W",
  element_prompts: ["prices"],
});
```

Text to Speech Example:

```ts
const resp = await soham.audio.text_to_speech({
  text: "Hello, how are you doing?",
});
```

Upload a file to use across any API example:

```ts
const file =
  /*reference to file blob or buffer*/

  await soham.store.upload(file, {
    filename: "receipt.png",
  });

// Now you can use the file_key in any API call
const ocrResp = await soham.vision.vocr({
  file_store_key: "receipt.png",
});

const objectDetectionResp = await soham.vision.object_detection({
  file_store_key: "receipt.png",
});
```

## Community

Join Soham community on [Discord](https://discord.gg/dj8fMBpnqd) to connect with other developers, share ideas, and get help with the SDK.

## Related Projects

- [Docs](https://jigsawstack.com/docs)
- [Python SDK](https://github.com/JigsawStack/jigsawstack-python)

## Contributing

Soham AI SDK is open-source and welcomes contributions. Please open an issue or submit a pull request with your changes. Make sure to be as descriptive as possible with your submissions, include examples if relevant.
