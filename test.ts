import { JigsawStack } from "./dist/index.mjs";

const jigsaw = JigsawStack({
  apiKey: "sk_61635c6833032ef257aab9157e7376b0dadf30806aea75b18029878accaa31669dd074c3468d35d490a88c41944c2b94607a8a43207a1b7049db41bde8b8cefd024Am7v5COxYErMQyQU6u",
});

const reponse = await jigsaw.image_generation({
  prompt: "A beautiful sunset over a calm ocean",
});

