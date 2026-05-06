"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  FlyPush: () => FlyPush,
  FlyPushError: () => FlyPushError
});
module.exports = __toCommonJS(index_exports);

// src/client.ts
var DEFAULT_BASE_URL = "https://api.flypush.io";
var MAX_RETRIES = 3;
var BASE_DELAY_MS = 2e3;
var FlyPushError = class extends Error {
  constructor(statusCode, code, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = "FlyPushError";
  }
};
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
var HttpClient = class {
  constructor(apiKey, baseUrl) {
    this.apiKey = apiKey;
    this.baseUrl = (baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  }
  async request(method, path, body) {
    const url = `${this.baseUrl}${path}`;
    let lastError;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        await sleep(BASE_DELAY_MS * 2 ** (attempt - 1));
      }
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`
        },
        body: body != null ? JSON.stringify(body) : void 0
      });
      if (res.ok) {
        return res.json();
      }
      let errorBody = {};
      try {
        errorBody = await res.json();
      } catch {
      }
      const err = new FlyPushError(
        res.status,
        errorBody.error?.code ?? "UNKNOWN_ERROR",
        errorBody.error?.message ?? `HTTP ${res.status}`,
        errorBody.error?.details
      );
      if (res.status < 500) throw err;
      lastError = err;
    }
    throw lastError;
  }
  get(path) {
    return this.request("GET", path);
  }
  post(path, body) {
    return this.request("POST", path, body);
  }
  put(path, body) {
    return this.request("PUT", path, body);
  }
  delete(path) {
    return this.request("DELETE", path);
  }
};

// src/resources/notifications.ts
function toApiTarget(t) {
  switch (t.type) {
    case "device":
      return { type: "DEVICE", value: t.token };
    case "topic":
      return { type: "TOPIC", value: t.topic };
    case "segment":
      return { type: "SEGMENT", value: t.segmentId };
    case "all":
      return { type: "ALL" };
  }
}
function toApiPayload(options) {
  const { to, ...rest } = options;
  return { ...rest, target: toApiTarget(to) };
}
function batchToApiPayload(item) {
  const { to, ...rest } = item;
  return { ...rest, target: toApiTarget(to) };
}
var NotificationsResource = class {
  constructor(http) {
    this.http = http;
  }
  send(options) {
    return this.http.post("/v1/notifications/send", toApiPayload(options));
  }
  sendBatch(items) {
    return this.http.post("/v1/notifications/send-batch", {
      notifications: items.map(batchToApiPayload)
    });
  }
  get(id) {
    return this.http.get(`/v1/notifications/${encodeURIComponent(id)}`);
  }
};

// src/resources/devices.ts
var DevicesResource = class {
  constructor(http) {
    this.http = http;
  }
  register(options) {
    return this.http.post("/v1/devices/register", options);
  }
  update(deviceId, options) {
    return this.http.put(`/v1/devices/${encodeURIComponent(deviceId)}`, options);
  }
  unregister(deviceId) {
    return this.http.delete(`/v1/devices/${encodeURIComponent(deviceId)}`);
  }
  subscribe(deviceId, topic) {
    return this.http.post(`/v1/devices/${encodeURIComponent(deviceId)}/subscribe`, { topic });
  }
  unsubscribe(deviceId, topic) {
    return this.http.post(`/v1/devices/${encodeURIComponent(deviceId)}/unsubscribe`, { topic });
  }
};

// src/resources/topics.ts
var TopicsResource = class {
  constructor(http) {
    this.http = http;
  }
  list() {
    return this.http.get("/v1/topics");
  }
  create(name, description) {
    return this.http.post("/v1/topics", { name, description });
  }
  delete(topicId) {
    return this.http.delete(`/v1/topics/${encodeURIComponent(topicId)}`);
  }
};

// src/index.ts
var FlyPush = class {
  constructor({ apiKey, baseUrl }) {
    if (!apiKey) throw new Error("FlyPush: apiKey is required");
    const http = new HttpClient(apiKey, baseUrl);
    this.notifications = new NotificationsResource(http);
    this.devices = new DevicesResource(http);
    this.topics = new TopicsResource(http);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FlyPush,
  FlyPushError
});
