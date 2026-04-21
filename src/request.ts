import { BaseConfig } from "../types";
import { removeUndefinedProperties } from "./helpers";

const baseURL = "https://api.jigsawstack.com";
// const baseURL = "http://localhost:3000";

export class RequestClient {
  constructor(private readonly config: BaseConfig) {}

  readonly fetchJSS = async (
    path: string,
    method: "POST" | "GET" | "DELETE",
    body?: Record<string, any> | Blob | FormData,
    searchParams?: {
      [key: string]: any;
    },
    headers?: {
      [key: string]: string;
    }
  ) => {
    const isFileUpload = body instanceof Blob || body instanceof Buffer;
    const isFormData = body instanceof FormData;

    searchParams = searchParams ? removeUndefinedProperties(searchParams) : undefined;

    const _headers = {
      "x-api-key": this.config?.apiKey,
      ...(!isFormData && { "Content-Type": isFileUpload ? "application/octet-stream" : "application/json" }),
      ...this.config?.headers,
      ...headers,
    };

    let _body;

    switch (true) {
      case isFileUpload:
      case isFormData:
        _body = body;
        break;
      default:
        _body = JSON.stringify(body);
    }

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

  readonly fetchJSSStream = async (
    path: string,
    method: "POST" | "GET",
    body?: Uint8Array | Record<string, any>,
    searchParams?: {
      [key: string]: any;
    },
    headers?: {
      [key: string]: string;
    },
    signal?: AbortSignal
  ): Promise<Response> => {
    const isBinary = body instanceof Uint8Array;

    searchParams = searchParams ? removeUndefinedProperties(searchParams) : undefined;

    const _headers = {
      "x-api-key": this.config?.apiKey,
      ...(!isBinary && body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...this.config?.headers,
      ...headers,
    };

    const _body = isBinary ? body : body !== undefined ? JSON.stringify(body) : undefined;

    const url = `${this.config?.baseURL || baseURL}${path}`;
    const urlParams = searchParams && Object.keys(searchParams).length ? `?${new URLSearchParams(searchParams).toString()}` : "";

    return fetch(`${url}${urlParams}`, {
      method,
      headers: _headers,
      body: method === "POST" ? _body : undefined,
      signal,
    });
  };
}
