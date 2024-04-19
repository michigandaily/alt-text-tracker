import type { CacheResponse } from './types';

export const D1CacheName = 'd1-michigan-daily-alt-text-tracker';
export const url = 'https://michigan-daily-alt-text-tracker.pages.dev/';

export const cachePut = async (url: URL | string, cache: Cache, response: CacheResponse) => {
	const entry = new Response(JSON.stringify(response));
	entry.headers.append('Cache-Control', 's-maxage=86400');

	await cache.put(url, entry);
};

export const cacheGet = async (url: URL | string, cache: Cache) => {
	const response = await cache.match(url);
	const entry = await response?.json();

	return entry;
};

export const cacheInvalidate = async (urls: (URL | string)[], cache: Cache) => {
	return Promise.all(urls.map((url) => cache.delete(url))).then((status) => status);
};
