import type { PageServerLoad } from './$types';

import { D1CacheName, cacheGet, cachePut} from '$lib/storage';
import type { ArticleEntry } from '$lib/types';
import { lastMonth } from '$lib/time';

import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ platform, url }) => {
	if (platform === undefined) {
		error(404, { message: 'Platform is undefined' });
	}

	const after = url.searchParams.get('after') ?? lastMonth.toISOString().split('T')[0];
	const cache = await platform.caches.open(D1CacheName);

	const entries = await cacheGet(url, cache) as ArticleEntry[];
	if (entries) {
		return {
			entries,
			after,
			cached: true,
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

	await cachePut(url, cache, response);

	return {
		entries: response.results as ArticleEntry[] | [],
		after,
		cached: false
	};
};
