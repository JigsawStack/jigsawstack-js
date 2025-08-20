import { createJigsawStackClient } from "./tests/test-helpers";

const client = createJigsawStackClient();

const result = await client.classification.text({
  dataset: [
    { type: "text" as const, value: "This is a great product! I love it." },
    { type: "text" as const, value: "This is a great product! I hate it." },
  ],
  labels: [
    { key: "positive", type: "text" as const, value: "positive sentiment" },
    { key: "negative", type: "text" as const, value: "negative sentiment" },
  ],
});

console.log(result);
