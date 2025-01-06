import "isomorphic-fetch";
import AudioApis from "./src/audio/audio";
import Geo from "./src/geo/geo";
import { RequestClient } from "./src/request";
import Search from "./src/search/search";
import Vision from "./src/vision/vision";
import Web from "./src/web/web";
import PromptEngine from "./src/prompt_engine";
import General from "./src/general";
import { File, KV } from "./src/store";
import Validate from "./src/validate";
import { BaseConfig } from "./types";

const JigsawStack = (config?: BaseConfig) => {
  const _apiKey = config?.apiKey || process?.env?.JIGSAWSTACK_API_KEY;

  if (!_apiKey) {
    throw new Error("No JigsawStack API key provided");
  }

  const client = new RequestClient({ ...config, apiKey: _apiKey });
  const general = new General(client);
  const web = new Web(client);
  const search = new Search(client);
  const vision = new Vision(client);
  const audio = new AudioApis(client);
  const geo = new Geo(client);
  const promptengine = new PromptEngine(client);
  const file = new File(client);
  const validate = new Validate(client);
  const store = {
    kv: new KV(client),
    upload: file.upload,
    retrieve: file.retrieve,
    delete: file.delete,
  };

  return {
    fetch: client.fetchJSS,
    sentiment: general.sentiment,
    translate: general.translate,
    image_generation: general.image_generation,
    summary: general.summary,
    prediction: general.prediction,
    text_to_sql: general.text_to_sql,
    embedding: general.embedding,
    audio,
    geo,
    vision,
    web: {
      ai_scrape: web.ai_scrape,
      scrape: web.scrape,
      dns: web.dns,
      html_to_any: web.html_to_any,
      search: search.search,
      search_suggestions: search.suggestion,
    },
    prompt_engine: promptengine,
    store,
    validate,
  };
};

export { JigsawStack };
