// Devices resource — register, update, unregister

import type { HttpClient } from "../client.js";

export type Platform = "IOS" | "ANDROID" | "WEB";

export interface RegisterOptions {
  platform: Platform;
  token: string;
  userId?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateOptions {
  userId?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface DeviceResponse {
  id: string;
  platform: Platform;
  token: string;
  userId?: string;
  tags: string[];
  lastSeenAt: string;
}

export class DevicesResource {
  constructor(private readonly http: HttpClient) {}

  register(options: RegisterOptions): Promise<DeviceResponse> {
    return this.http.post<DeviceResponse>("/v1/devices/register", options);
  }

  update(deviceId: string, options: UpdateOptions): Promise<DeviceResponse> {
    return this.http.put<DeviceResponse>(`/v1/devices/${encodeURIComponent(deviceId)}`, options);
  }

  unregister(deviceId: string): Promise<void> {
    return this.http.delete<void>(`/v1/devices/${encodeURIComponent(deviceId)}`);
  }

  subscribe(deviceId: string, topic: string): Promise<void> {
    return this.http.post<void>(`/v1/devices/${encodeURIComponent(deviceId)}/subscribe`, { topic });
  }

  unsubscribe(deviceId: string, topic: string): Promise<void> {
    return this.http.post<void>(`/v1/devices/${encodeURIComponent(deviceId)}/unsubscribe`, { topic });
  }
}
