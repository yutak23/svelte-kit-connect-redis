# sveltekit-connect-redis

[![npm](https://img.shields.io/npm/v/sveltekit-connect-redis.svg)](https://www.npmjs.com/package/sveltekit-connect-redis)
[![test](https://github.com/yutak23/sveltekit-connect-redis/actions/workflows/test.yaml/badge.svg)](https://github.com/yutak23/sveltekit-connect-redis/actions/workflows/test.yaml)
![style](https://img.shields.io/badge/code%20style-airbnb-ff5a5f.svg)

**sveltekit-connect-redis** provides Redis session storage for [svelte-kit-sessions](https://www.npmjs.com/package/svelte-kit-sessions).

## Installation

**sveltekit-connect-redis** requires [`svelte-kit-sessions`](https://www.npmjs.com/package/svelte-kit-sessions) to installed and one of the following compatible Redis clients:

- [`redis`](https://www.npmjs.com/package/redis)
- [`ioredis`](https://www.npmjs.com/package/ioredis)

Install with `redis`:

```console
$ npm install redis sveltekit-connect-redis svelte-kit-sessions

$ yarn add redis sveltekit-connect-redis svelte-kit-sessions

$ pnpm add redis sveltekit-connect-redis svelte-kit-sessions
```

Install with `ioredis`:

```console
$ npm install ioredis sveltekit-connect-redis svelte-kit-sessions

$ yarn add ioredis sveltekit-connect-redis svelte-kit-sessions

$ pnpm add ioredis sveltekit-connect-redis svelte-kit-sessions
```

## Usage

`sveltekit-connect-redis` can be used as a custom store for `svelte-kit-sessions` as follows.

**Note** For more information about `svelte-kit-sessions`, see https://www.npmjs.com/package/svelte-kit-sessions.

### redis

```ts
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { sveltekitSessionHandle } from 'svelte-kit-sessions';
import RedisStore from 'sveltekit-connect-redis';
import { createClient } from 'redis';

const client = redis.createClient({
	url: 'redis://{your redis endpoint}'
});
const clientConnection = await client.connect();

export const handle: Handle = sveltekitSessionHandle({
	secret: 'secret',
	store: new RedisStore({ client: clientConnection })
});
```

### ioredis

```ts
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { sveltekitSessionHandle } from 'svelte-kit-sessions';
import RedisStore from 'sveltekit-connect-redis';
import { Redis } from 'ioredis';

const client = new Redis({
	host: '{your redis host}',
	port: 6379
});

export const handle: Handle = sveltekitSessionHandle({
	secret: 'secret',
	store: new RedisStore({ client })
});
```

## API

```ts
import RedisStore from 'sveltekit-connect-redis';

new RedisStore(options);
```

### new RedisStore(options)

Create a Redis store for `svelte-kit-sessions`.

### Options

A summary of the `options` is as follows.

| Name       | Type                                   | required/optional | Description                                                                                                                               |
| ---------- | -------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| client     | redis.RedisClientType \| ioredis.Redis | _required_        | An instance of [`redis`](https://www.npmjs.com/package/redis) or [`ioredis`](https://www.npmjs.com/package/ioredis)                       |
| prefix     | string                                 | _optional_        | Key prefix in Redis (default: `sess:`).                                                                                                   |
| serializer | Serializer                             | _optional_        | Provide a custom encoder/decoder to use when storing and retrieving session data from Redis (default: `JSON.parse` and `JSON.stringify`). |
| ttl        | number                                 | _optional_        | ttl to be used if ttl is _Infinity_ when used from `svelte-kit-sessions`                                                                  |

#### client

An instance of [`redis`](https://www.npmjs.com/package/redis) or [`ioredis`](https://www.npmjs.com/package/ioredis).

#### prefix

Key prefix in Redis (default: `sess:`).

#### serializer

Provide a custom encoder/decoder to use when storing and retrieving session data from Redis (default: `JSON.parse` and `JSON.stringify`).

**Note** When setting up a custom serializer, the following interface must be satisfied.

```ts
interface Serializer {
	parse(s: string): SessionStoreData | Promise<SessionStoreData>;
	stringify(data: SessionStoreData): string;
}
```

#### ttl

When `svelte-kit-sessions` calls a method of the store (the `set` function), ttl(milliseconds) is passed to it. However, if the cookie options `expires` and `maxAge` are not set, the ttl passed will be _Infinity_.

If the ttl passed is _Infinity_, the ttl to be set can be set with this option. The unit is milliseconds.

```ts
// `sveltekit-connect-redis` implementation excerpts
const ONE_DAY_IN_SECONDS = 86400;
export default class RedisStore implements Store {
	constructor(options: RedisStoreOptions) {
		this.ttl = options.ttl || ONE_DAY_IN_SECONDS * 1000;
	}

	ttl: number;

	async set(id: string, storeData: SessionStoreData, ttl: number): Promise<void> {
		// omission ...
		if (ttl !== Infinity) {
			await this.client.set(key, serialized, { PX: ttl }); // if `ttl` passed as argument is *not* Infinity, use the argument `ttl` as it is.
			return;
		}
		await this.client.set(key, serialized, { PX: this.ttl }); // if `ttl` passed as argument is *not* Infinity, use `options.ttl` or default.
	}
}
```

## License

[MIT licensed](./LICENSE)
