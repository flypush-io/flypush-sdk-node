declare class FlyPushError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly details?: unknown | undefined;
    constructor(statusCode: number, code: string, message: string, details?: unknown | undefined);
}
declare class HttpClient {
    private readonly baseUrl;
    private readonly apiKey;
    constructor(apiKey: string, baseUrl?: string);
    request<T>(method: string, path: string, body?: unknown): Promise<T>;
    get<T>(path: string): Promise<T>;
    post<T>(path: string, body: unknown): Promise<T>;
    put<T>(path: string, body: unknown): Promise<T>;
    delete<T>(path: string): Promise<T>;
}

type NotificationTarget = {
    type: "device";
    token: string;
} | {
    type: "topic";
    topic: string;
} | {
    type: "segment";
    segmentId: string;
} | {
    type: "all";
};
interface SendOptions {
    to: NotificationTarget;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    imageUrl?: string;
    scheduledAt?: string;
    platforms?: Array<"IOS" | "ANDROID" | "WEB">;
}
interface BatchItem {
    to: NotificationTarget;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    imageUrl?: string;
}
interface SendResponse {
    id: string;
    status: string;
}
interface SendBatchResponse {
    ids: string[];
}
declare class NotificationsResource {
    private readonly http;
    constructor(http: HttpClient);
    send(options: SendOptions): Promise<SendResponse>;
    sendBatch(items: BatchItem[]): Promise<SendBatchResponse>;
    get(id: string): Promise<unknown>;
}

type Platform = "IOS" | "ANDROID" | "WEB";
interface RegisterOptions {
    platform: Platform;
    token: string;
    userId?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
}
interface UpdateOptions {
    userId?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
}
interface DeviceResponse {
    id: string;
    platform: Platform;
    token: string;
    userId?: string;
    tags: string[];
    lastSeenAt: string;
}
declare class DevicesResource {
    private readonly http;
    constructor(http: HttpClient);
    register(options: RegisterOptions): Promise<DeviceResponse>;
    update(deviceId: string, options: UpdateOptions): Promise<DeviceResponse>;
    unregister(deviceId: string): Promise<void>;
    subscribe(deviceId: string, topic: string): Promise<void>;
    unsubscribe(deviceId: string, topic: string): Promise<void>;
}

interface TopicResponse {
    id: string;
    name: string;
    description?: string;
    subscriberCount: number;
}
declare class TopicsResource {
    private readonly http;
    constructor(http: HttpClient);
    list(): Promise<TopicResponse[]>;
    create(name: string, description?: string): Promise<TopicResponse>;
    delete(topicId: string): Promise<void>;
}

interface FlyPushOptions {
    apiKey: string;
    baseUrl?: string;
}
declare class FlyPush {
    readonly notifications: NotificationsResource;
    readonly devices: DevicesResource;
    readonly topics: TopicsResource;
    constructor({ apiKey, baseUrl }: FlyPushOptions);
}

export { type BatchItem, type DeviceResponse, FlyPush, FlyPushError, type FlyPushOptions, type NotificationTarget, type Platform, type RegisterOptions, type SendBatchResponse, type SendOptions, type SendResponse, type TopicResponse, type UpdateOptions };
