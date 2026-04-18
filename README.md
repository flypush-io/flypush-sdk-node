# @flypush/node

FlyPush Node.js server SDK — send push notifications from your backend.

## Installation

```bash
npm install @flypush/node
```

## Quick start

```typescript
import { FlyPush } from "@flypush/node";

const client = new FlyPush({ apiKey: "fp_your_api_key" });

// Send to all devices
await client.notifications.send({
  to: { type: "all" },
  title: "Hello!",
  body: "Your order has shipped.",
  data: { orderId: "abc123" },
});

// Send to a topic
await client.notifications.send({
  to: { type: "topic", topic: "breaking-news" },
  title: "Breaking News",
  body: "Something happened.",
});

// Send to a specific device token
await client.notifications.send({
  to: { type: "device", token: "device_token_here" },
  title: "Personal alert",
  body: "Just for you.",
});
```

## Batch send

```typescript
await client.notifications.sendBatch([
  { to: { type: "device", token: "tok1" }, title: "Hi Alice", body: "..." },
  { to: { type: "device", token: "tok2" }, title: "Hi Bob",   body: "..." },
]);
```

## Device management

```typescript
// Register a device
const device = await client.devices.register({
  platform: "IOS",
  token: "apns_device_token",
  userId: "user_123",
  tags: ["premium", "us"],
});

// Update tags
await client.devices.update(device.id, { tags: ["premium", "us", "beta"] });

// Unregister
await client.devices.unregister(device.id);
```

## Topics

```typescript
await client.topics.create("sports", "Sports fans");
const topics = await client.topics.list();
```

## Error handling

```typescript
import { FlyPushError } from "@flypush/node";

try {
  await client.notifications.send({ ... });
} catch (err) {
  if (err instanceof FlyPushError) {
    console.error(err.code, err.statusCode, err.message);
  }
}
```

The SDK automatically retries `5xx` errors up to 3 times with exponential backoff (2s, 4s, 8s).

## Options

| Option    | Type     | Required | Description                              |
|-----------|----------|----------|------------------------------------------|
| `apiKey`  | `string` | Yes      | Your FlyPush API key (`fp_...`)          |
| `baseUrl` | `string` | No       | Override API base URL (default: `https://api.flypush.io`) |

## Requirements

Node.js ≥ 18 (uses native `fetch`).
