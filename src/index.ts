// FlyPush Node.js server SDK entry point

import { HttpClient } from "./client.js";
import { NotificationsResource } from "./resources/notifications.js";
import { DevicesResource } from "./resources/devices.js";
import { TopicsResource } from "./resources/topics.js";

export { FlyPushError } from "./client.js";
export type { NotificationTarget, SendOptions, BatchItem, SendResponse, SendBatchResponse } from "./resources/notifications.js";
export type { Platform, RegisterOptions, UpdateOptions, DeviceResponse } from "./resources/devices.js";
export type { TopicResponse } from "./resources/topics.js";

export interface FlyPushOptions {
  apiKey: string;
  baseUrl?: string;
}

export class FlyPush {
  readonly notifications: NotificationsResource;
  readonly devices: DevicesResource;
  readonly topics: TopicsResource;

  constructor({ apiKey, baseUrl }: FlyPushOptions) {
    if (!apiKey) throw new Error("FlyPush: apiKey is required");
    const http = new HttpClient(apiKey, baseUrl);
    this.notifications = new NotificationsResource(http);
    this.devices = new DevicesResource(http);
    this.topics = new TopicsResource(http);
  }
}
