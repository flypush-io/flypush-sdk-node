// Notifications resource — send and sendBatch

import type { HttpClient } from "../client.js";

export type NotificationTarget =
  | { type: "device"; token: string }
  | { type: "topic"; topic: string }
  | { type: "segment"; segmentId: string }
  | { type: "all" };

export interface SendOptions {
  to: NotificationTarget;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  imageUrl?: string;
  scheduledAt?: string; // ISO 8601
  platforms?: Array<"IOS" | "ANDROID" | "WEB">;
}

export interface BatchItem {
  to: NotificationTarget;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  imageUrl?: string;
}

export interface SendResponse {
  id: string;
  status: string;
}

export interface SendBatchResponse {
  ids: string[];
}

// Translate SDK-friendly target format to the wire format the backend expects.
// SDK uses lowercase types + per-target field names; API uses uppercase enum + single "value" field.
function toApiTarget(t: NotificationTarget): { type: string; value?: string } {
  switch (t.type) {
    case "device":  return { type: "DEVICE",  value: t.token };
    case "topic":   return { type: "TOPIC",   value: t.topic };
    case "segment": return { type: "SEGMENT", value: t.segmentId };
    case "all":     return { type: "ALL" };
  }
}

function toApiPayload(options: SendOptions): object {
  const { to, ...rest } = options;
  return { ...rest, target: toApiTarget(to) };
}

function batchToApiPayload(item: BatchItem): object {
  const { to, ...rest } = item;
  return { ...rest, target: toApiTarget(to) };
}

export class NotificationsResource {
  constructor(private readonly http: HttpClient) {}

  send(options: SendOptions): Promise<SendResponse> {
    return this.http.post<SendResponse>("/v1/notifications/send", toApiPayload(options));
  }

  sendBatch(items: BatchItem[]): Promise<SendBatchResponse> {
    return this.http.post<SendBatchResponse>("/v1/notifications/send-batch", {
      notifications: items.map(batchToApiPayload),
    });
  }

  get(id: string): Promise<unknown> {
    return this.http.get(`/v1/notifications/${encodeURIComponent(id)}`);
  }
}
