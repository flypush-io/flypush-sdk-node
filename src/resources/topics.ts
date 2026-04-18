// Topics resource — create, list, subscribe, unsubscribe

import type { HttpClient } from "../client.js";

export interface TopicResponse {
  id: string;
  name: string;
  description?: string;
  subscriberCount: number;
}

export class TopicsResource {
  constructor(private readonly http: HttpClient) {}

  list(): Promise<TopicResponse[]> {
    return this.http.get<TopicResponse[]>("/v1/topics");
  }

  create(name: string, description?: string): Promise<TopicResponse> {
    return this.http.post<TopicResponse>("/v1/topics", { name, description });
  }

  delete(topicId: string): Promise<void> {
    return this.http.delete<void>(`/v1/topics/${encodeURIComponent(topicId)}`);
  }
}
