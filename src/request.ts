import { BaseConfig } from "../types";

const baseURL = "https://api.jigsawstack.com/v1";

export class RequestClient {
  constructor(private readonly config: BaseConfig) {}

  readonly fetchJSS = async (
    path: string,
    method: "POST" | "GET" | "DELETE",
    body?: Record<string, any> | Blob,
    searchParams?: {
      [key: string]: any;
    },
    headers?: {
      [key: string]: string;
    }
  ) => {
    const disableRequestLogging = this.config?.extraConfig?.disableRequestLogging;
    const isFileUpload = body instanceof Blob || body instanceof Buffer;

    const _headers = {
      "x-api-key": this.config?.apiKey,
      "Content-Type": isFileUpload ? "application/octet-stream" : "application/json",
      ...headers,
      ["x-jigsaw-no-request-log"]: disableRequestLogging && "true",
    };

    const _body = isFileUpload ? body : JSON.stringify(body);
    const url = `${this.config?.baseURL || baseURL}${path}`;
    const urlParams = searchParams && Object.keys(searchParams).length ? `?${new URLSearchParams(searchParams).toString()}` : "";

    const resp = await fetch(`${url}${urlParams}`, {
      method,
      headers: _headers,
      body: ["POST", "PATCH"].includes(method) ? _body : undefined,
    });

    if (!resp.ok) {
      const error = await resp.json();
      throw error;
    }

    const result = resp.headers.get("Content-Type")?.includes("application/json") ? await resp.json() : resp;

    return result;
  };
}
