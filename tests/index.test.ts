import { describe, it, expect, beforeEach } from 'vitest';
import type { SessionCookieOptions } from 'svelte-kit-sessions';
import * as upstashRedis from '@upstash/redis';
import * as upstashRedisCloudflare from '@upstash/redis/cloudflare';
import * as upstashRedisFastly from '@upstash/redis/fastly';
import * as ioredis from 'ioredis';
import * as redis from 'redis';
import RedisStore from '../src/index.js';

declare module 'svelte-kit-sessions' {
	interface SessionData {
		foo?: string;
	}
}

const dumyCookieOptions: SessionCookieOptions = {
	path: '/',
	httpOnly: true,
	secure: true,
	sameSite: 'lax'
};

describe('Test RedisStore', () => {
	describe('client is @upstash/redis', () => {
		const client = new upstashRedis.Redis({
			url: 'http://localhost:8079',
			token: 'example_token'
		});
		const store = new RedisStore({ client });

		beforeEach(async () => {
			await client.flushdb();
		});

		describe('get', () => {
			it('should be null', async () => {
				const data = await store.get('sessionId');
				expect(data).toBe(null);
			});

			it('should not be null', async () => {
				await store.set('sessionId', { cookie: dumyCookieOptions, data: { foo: 'foo' } }, Infinity);
				const data = await store.get('sessionId');
				expect(data).toEqual({ cookie: dumyCookieOptions, data: { foo: 'foo' } });
			});
		});

		describe('set', () => {
			it('data is empty object', async () => {
				await store.set('sessionId', { cookie: dumyCookieOptions, data: {} }, Infinity);
				const data = await store.get('sessionId');
				expect(data).toEqual({ cookie: dumyCookieOptions, data: {} });
			});

			it('ttl is 100ms and store should be expired', async () => {
				await store.set('sessionId', { cookie: dumyCookieOptions, data: { foo: 'foo' } }, 100);

				await new Promise((resolve) => {
					setTimeout(resolve, 100);
				});

				const data = await store.get('sessionId');
				expect(data).toBe(null);
			});
		});

		describe('destroy', () => {
			it('should be null', async () => {
				await store.set('sessionId', { cookie: dumyCookieOptions, data: { foo: 'foo' } }, 100);
				await store.destroy('sessionId');
				const data = await store.get('sessionId');
				expect(data).toBe(null);
			});

			it('should not be error when not exist key', async () => {
				await store.destroy('sessionId');
			});
		});

		describe('touch', () => {
			it('should be updated ttl', async () => {
				await store.set('sessionId', { cookie: dumyCookieOptions, data: { foo: 'foo' } }, 100);
				await store.touch('sessionId', 500);

				await new Promise((resolve) => {
					setTimeout(resolve, 250);
				});

				const data = await store.get('sessionId');
				expect(data).toEqual({ cookie: dumyCookieOptions, data: { foo: 'foo' } });
			});

			it('should not be error when not exist key', async () => {
				await store.touch('sessionId', 1000);
			});
		});
	});

	describe('client is @upstash/redis/cloudflare', () => {
		const client = new upstashRedisCloudflare.Redis({
			url: 'http://localhost:8079',
			token: 'example_token'
		});
		const store = new RedisStore({ client });

		beforeEach(async () => {
			await client.flushdb();
		});

		describe('get', () => {
			it('should be null', async () => {
				const data = await store.get('sessionId');
				expect(data).toBe(null);
			});

			it('should not be null', async () => {
				await store.set('sessionId', { cookie: dumyCookieOptions, data: { foo: 'foo' } }, Infinity);
				const data = await store.get('sessionId');
				expect(data).toEqual({ cookie: dumyCookieOptions, data: { foo: 'foo' } });
			});
		});

		describe('set', () => {
			it('data is empty object', async () => {
				await store.set('sessionId', { cookie: dumyCookieOptions, data: {} }, Infinity);
				const data = await store.get('sessionId');
				expect(data).toEqual({ cookie: dumyCookieOptions, data: {} });
			});

			it('ttl is 100ms and store should be expired', async () => {
				await store.set('sessionId', { cookie: dumyCookieOptions, data: { foo: 'foo' } }, 100);

				await new Promise((resolve) => {
					setTimeout(resolve, 100);
				});

				const data = await store.get('sessionId');
				expect(data).toBe(null);
			});
		});

		describe('destroy', () => {
			it('should be null', async () => {
				await store.set('sessionId', { cookie: dumyCookieOptions, data: { foo: 'foo' } }, 100);
				await store.destroy('sessionId');
				const data = await store.get('sessionId');
				expect(data).toBe(null);
			});

			it('should not be error when not exist key', async () => {
				await store.destroy('sessionId');
			});
		});

		describe('touch', () => {
			it('should be updated ttl', async () => {
				await store.set('sessionId', { cookie: dumyCookieOptions, data: { foo: 'foo' } }, 100);
				await store.touch('sessionId', 500);

				await new Promise((resolve) => {
					setTimeout(resolve, 250);
				});

				const data = await store.get('sessionId');
				expect(data).toEqual({ cookie: dumyCookieOptions, data: { foo: 'foo' } });
			});

			it('should not be error when not exist key', async () => {
				await store.touch('sessionId', 1000);
			});
		});
	});

	describe('client is @upstash/redis/fastly', () => {
		const client = new upstashRedisFastly.Redis({
			url: 'http://localhost:8079',
			token: 'example_token',
			backend: 'example_backend'
		});
		const store = new RedisStore({ client });

		beforeEach(async () => {
			await client.flushdb();
		});

		describe('get', () => {
			it('should be null', async () => {
				const data = await store.get('sessionId');
				expect(data).toBe(null);
			});

			it('should not be null', async () => {
				await store.set('sessionId', { cookie: dumyCookieOptions, data: { foo: 'foo' } }, Infinity);
				const data = await store.get('sessionId');
				expect(data).toEqual({ cookie: dumyCookieOptions, data: { foo: 'foo' } });
			});
		});

		describe('set', () => {
			it('data is empty object', async () => {
				await store.set('sessionId', { cookie: dumyCookieOptions, data: {} }, Infinity);
				const data = await store.get('sessionId');
				expect(data).toEqual({ cookie: dumyCookieOptions, data: {} });
			});

			it('ttl is 100ms and store should be expired', async () => {
				await store.set('sessionId', { cookie: dumyCookieOptions, data: { foo: 'foo' } }, 100);

				await new Promise((resolve) => {
					setTimeout(resolve, 100);
				});

				const data = await store.get('sessionId');
				expect(data).toBe(null);
			});
		});

		describe('destroy', () => {
			it('should be null', async () => {
				await store.set('sessionId', { cookie: dumyCookieOptions, data: { foo: 'foo' } }, 100);
				await store.destroy('sessionId');
				const data = await store.get('sessionId');
				expect(data).toBe(null);
			});

			it('should not be error when not exist key', async () => {
				await store.destroy('sessionId');
			});
		});

		describe('touch', () => {
			it('should be updated ttl', async () => {
				await store.set('sessionId', { cookie: dumyCookieOptions, data: { foo: 'foo' } }, 100);
				await store.touch('sessionId', 500);

				await new Promise((resolve) => {
					setTimeout(resolve, 250);
				});

				const data = await store.get('sessionId');
				expect(data).toEqual({ cookie: dumyCookieOptions, data: { foo: 'foo' } });
			});

			it('should not be error when not exist key', async () => {
				await store.touch('sessionId', 1000);
			});
		});
	});

	describe('client is ioredis', () => {
		const client = new ioredis.Redis({
			host: 'localhost',
			port: 6379,
			db: 0
		});
		const store = new RedisStore({ client });

		beforeEach(async () => {
			await client.flushdb();
		});

		describe('get', () => {
			it('should be null', async () => {
				const data = await store.get('sessionId');
				expect(data).toBe(null);
			});

			it('should not be null', async () => {
				await store.set('sessionId', { cookie: dumyCookieOptions, data: { foo: 'foo' } }, Infinity);
				const data = await store.get('sessionId');
				expect(data).toEqual({ cookie: dumyCookieOptions, data: { foo: 'foo' } });
			});
		});

		describe('set', () => {
			it('data is empty object', async () => {
				await store.set('sessionId', { cookie: dumyCookieOptions, data: {} }, Infinity);
				const data = await store.get('sessionId');
				expect(data).toEqual({ cookie: dumyCookieOptions, data: {} });
			});

			it('ttl is 100ms and store should be expired', async () => {
				await store.set('sessionId', { cookie: dumyCookieOptions, data: { foo: 'foo' } }, 100);

				await new Promise((resolve) => {
					setTimeout(resolve, 100);
				});

				const data = await store.get('sessionId');
				expect(data).toBe(null);
			});
		});

		describe('destroy', () => {
			it('should be null', async () => {
				await store.set('sessionId', { cookie: dumyCookieOptions, data: { foo: 'foo' } }, 100);
				await store.destroy('sessionId');
				const data = await store.get('sessionId');
				expect(data).toBe(null);
			});

			it('should not be error when not exist key', async () => {
				await store.destroy('sessionId');
			});
		});

		describe('touch', () => {
			it('should be updated ttl', async () => {
				await store.set('sessionId', { cookie: dumyCookieOptions, data: { foo: 'foo' } }, 100);
				await store.touch('sessionId', 500);

				await new Promise((resolve) => {
					setTimeout(resolve, 250);
				});

				const data = await store.get('sessionId');
				expect(data).toEqual({ cookie: dumyCookieOptions, data: { foo: 'foo' } });
			});

			it('should not be error when not exist key', async () => {
				await store.touch('sessionId', 1000);
			});
		});
	});

	describe('client is redis', async () => {
		const client = redis.createClient({
			url: 'redis://localhost:6379/0'
		});
		const clientConnection = await client.connect();
		const store = new RedisStore({ client: clientConnection });

		beforeEach(async () => {
			await clientConnection.flushAll();
		});

		describe('get', () => {
			it('should be null', async () => {
				const data = await store.get('sessionId');
				expect(data).toBe(null);
			});

			it('should not be null', async () => {
				await store.set('sessionId', { cookie: dumyCookieOptions, data: { foo: 'foo' } }, Infinity);
				const data = await store.get('sessionId');
				expect(data).toEqual({ cookie: dumyCookieOptions, data: { foo: 'foo' } });
			});
		});

		describe('set', () => {
			it('data is empty object', async () => {
				await store.set('sessionId', { cookie: dumyCookieOptions, data: {} }, Infinity);
				const data = await store.get('sessionId');
				expect(data).toEqual({ cookie: dumyCookieOptions, data: {} });
			});

			it('ttl is 100ms and store should be expired', async () => {
				await store.set('sessionId', { cookie: dumyCookieOptions, data: { foo: 'foo' } }, 100);

				await new Promise((resolve) => {
					setTimeout(resolve, 200);
				});

				const data = await store.get('sessionId');
				expect(data).toBe(null);
			});
		});

		describe('destroy', () => {
			it('should be null', async () => {
				await store.set('sessionId', { cookie: dumyCookieOptions, data: { foo: 'foo' } }, 100);
				await store.destroy('sessionId');
				const data = await store.get('sessionId');
				expect(data).toBe(null);
			});

			it('should not be error when not exist key', async () => {
				await store.destroy('sessionId');
			});
		});

		describe('touch', () => {
			it('should be updated ttl', async () => {
				await store.set('sessionId', { cookie: dumyCookieOptions, data: { foo: 'foo' } }, 100);
				await store.touch('sessionId', 500);

				await new Promise((resolve) => {
					setTimeout(resolve, 250);
				});

				const data = await store.get('sessionId');
				expect(data).toEqual({ cookie: dumyCookieOptions, data: { foo: 'foo' } });
			});

			it('should not be error when not exist key', async () => {
				await store.touch('sessionId', 1000);
			});
		});
	});
});
