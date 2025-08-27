import "isomorphic-fetch";
import { BaseConfig } from "../types";
import AudioApis from "./audio/audio";
import Classification from "./classification/index";
import General from "./general";
import { RequestClient } from "./request";
import { File } from "./store/file";
import Validate from "./validate";
import Vision from "./vision/vision";
import Web from "./web/web";

export const JigsawStack = (config?: BaseConfig) => {
  const _apiKey = config?.apiKey || process?.env?.JIGSAWSTACK_API_KEY;

  if (!_apiKey) {
    throw new Error("No JigsawStack API key provided");
  }

  const client = new RequestClient({ ...config, apiKey: _apiKey });
  const general = new General(client);
  const web = new Web(client);
  const vision = new Vision(client);
  const audio = new AudioApis(client);
  const file = new File(client);
  const validate = new Validate(client);
  const store = {
    upload: file.upload,
    retrieve: file.retrieve,
    delete: file.delete,
  };
  const classification = new Classification(client);

  return {
    sentiment: general.sentiment,
    translate: general.translate,
    image_generation: general.image_generation,
    summary: general.summary,
    prediction: general.prediction,
    text_to_sql: general.text_to_sql,
    embedding: general.embedding,
    audio,
    vision: {
      vocr: vision.vocr.bind(vision),
      object_detection: vision.object_detection.bind(vision),
    },
    web: {
      ai_scrape: web.ai_scrape.bind(web),
      html_to_any: web.html_to_any.bind(web),
      search: web.search.bind(web),
      search_suggestions: web.search_suggestions.bind(web),
    },
    store,
    validate,
    classification,
  };
};
