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

export class NotificationsResource {
  constructor(private readonly http: HttpClient) {}

  send(options: SendOptions): Promise<SendResponse> {
    return this.http.post<SendResponse>("/v1/notifications/send", options);
  }

  sendBatch(items: BatchItem[]): Promise<SendBatchResponse> {
    return this.http.post<SendBatchResponse>("/v1/notifications/send-batch", { notifications: items });
  }

  get(id: string): Promise<unknown> {
    return this.http.get(`/v1/notifications/${encodeURIComponent(id)}`);
  }
}
