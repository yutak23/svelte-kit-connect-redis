import type { SessionStoreData, Store } from 'svelte-kit-sessions';
import * as ioredis from 'ioredis';
import * as redis from 'redis';

interface Serializer {
	parse(s: string): SessionStoreData | Promise<SessionStoreData>;
	stringify(data: SessionStoreData): string;
}

interface RedisStoreOptions {
	/**
	 * An instance of [`redis`](https://www.npmjs.com/package/redis) or [`ioredis`](https://www.npmjs.com/package/ioredis).
	 */
	client: ioredis.Redis | redis.RedisClientType;
	/**
	 * The prefix of the key in redis.
	 * @default 'sess:'
	 */
	prefix?: string;
	/**
	 * The serializer to use.
	 * @default JSON
	 */
	serializer?: Serializer;
	/**
	 * Time to live in milliseconds.
	 * This ttl to be used if ttl is _Infinity_ when used from `svelte-kit-sessions`
	 * @default 86400 * 1000
	 */
	ttl?: number;
}

const ONE_DAY_IN_SECONDS = 86400;

export default class RedisStore implements Store {
	constructor(options: RedisStoreOptions) {
		this.client = options.client;
		this.prefix = options.prefix || 'sess:';
		this.serializer = options.serializer || JSON;
		this.ttl = options.ttl || ONE_DAY_IN_SECONDS * 1000;
	}

	/**
	 * An instance of [`redis`](https://www.npmjs.com/package/redis) or [`ioredis`](https://www.npmjs.com/package/ioredis).
	 */
	client: ioredis.Redis | redis.RedisClientType;

	/**
	 * The prefix of the key in redis.
	 * @default 'sess:'
	 */
	prefix: string;

	/**
	 * The serializer to use.
	 * @default JSON
	 */
	serializer: Serializer;

	/**
	 * Time to live in milliseconds.
	 * default: 86400 * 1000
	 */
	ttl: number;

	async get(id: string): Promise<SessionStoreData | null> {
		const key = this.prefix + id;
		const storeData = (await this.client.get(key)) as string;
		return storeData ? this.serializer.parse(storeData) : null;
	}

	async set(id: string, storeData: SessionStoreData, ttl: number): Promise<void> {
		const key = this.prefix + id;
		const serialized = this.serializer.stringify(storeData);

		// Infinite time does not support, so it is implemented separately.
		if (ttl !== Infinity) {
			if (this.client instanceof ioredis.Redis) {
				await this.client.set(key, serialized, 'PX', ttl);
				return;
			}
			await this.client.set(key, serialized, { PX: ttl });
			return;
		}

		if (this.client instanceof ioredis.Redis) {
			await this.client.set(key, serialized, 'PX', this.ttl);
			return;
		}
		await this.client.set(key, serialized, { PX: this.ttl });
	}

	async destroy(id: string): Promise<void> {
		const key = this.prefix + id;
		await this.client.del(key);
	}

	async touch(id: string, ttl: number): Promise<void> {
		const key = this.prefix + id;
		await this.client.expire(key, ttl);
	}
}
