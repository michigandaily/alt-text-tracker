import type { PageServerLoad } from './$types';

import { D1CacheName, cacheGet, cachePut } from '$lib/storage';
import type { ArticleEntry, CacheResponse } from '$lib/types';
import { lastMonth } from '$lib/time';

import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ platform, url }) => {
	if (platform === undefined) {
		error(400, { message: 'Platform is undefined' });
	}

	const after = url.searchParams.get('after') ?? lastMonth.toISOString().split('T')[0];
	const cache = await platform.caches.open(D1CacheName);

	const cacheEntry = (await cacheGet(url.origin, cache)) as CacheResponse | undefined;

	if (cacheEntry && cacheEntry.after! <= after) {
		return {
			entries: cacheEntry.entries,
			after,
			cached: true,
			production: platform.env.PRODUCTION,
		};
	}

	const response = await platform.env.DB.prepare(
		'SELECT date, images_published, images_published_with_alt_text, categories FROM articles WHERE date > ?'
	)
		.bind(after)
		.all();

	if (response.error) {
		error(400, { message: response.error });
	}

	platform.context.waitUntil(
		cachePut(url.origin, cache, {
			entries: response.results as ArticleEntry[] | [],
			after
		})
	);

	return {
		entries: response.results as ArticleEntry[] | [],
		after,
		cached: false,
		production: platform.env.PRODUCTION,
	};
};
