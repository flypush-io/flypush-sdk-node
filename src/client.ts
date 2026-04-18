// HTTP client with automatic retry (exponential backoff on 5xx)

const DEFAULT_BASE_URL = "https://api.flypush.io";
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000;

export class FlyPushError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "FlyPushError";
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = (baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  }

  async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    let lastError: FlyPushError | undefined;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        await sleep(BASE_DELAY_MS * 2 ** (attempt - 1));
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: body != null ? JSON.stringify(body) : undefined,
      });

      if (res.ok) {
        return res.json() as Promise<T>;
      }

      let errorBody: { error?: { code?: string; message?: string; details?: unknown } } = {};
      try {
        errorBody = await res.json();
      } catch {
        // ignore parse errors
      }

      const err = new FlyPushError(
        res.status,
        errorBody.error?.code ?? "UNKNOWN_ERROR",
        errorBody.error?.message ?? `HTTP ${res.status}`,
        errorBody.error?.details
      );

      // Only retry on 5xx
      if (res.status < 500) throw err;
      lastError = err;
    }

    throw lastError!;
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>("PUT", path, body);
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>("DELETE", path);
  }
}
