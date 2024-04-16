import type { PageServerLoad } from './$types';
import type { ArticleEntry } from '$lib/types';
import { lastMonth } from '$lib/time';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ platform, url }) => {
	const after = url.searchParams.get('after') ?? lastMonth.toISOString().split('T')[0];

	if (platform === undefined) {
		error(404, { message: 'Platform is undefined' });
	}

	const cache = platform.caches.default;

	const cacheResp = await cache.match(url);
	const entries = await cacheResp?.json();

	if (entries) {
		return {
			entries,
			after
		};
	}

	const resp = await platform.env.DB.prepare(
		'SELECT date, images_published, images_published_with_alt_text, categories FROM articles WHERE date > ?'
	)
		.bind(after)
		.all();

	const cacheEntry = new Response(JSON.stringify(resp.results));
	cacheEntry.headers.append('Cache-Control', 's-maxage=100');

	await cache.put(url, cacheEntry);

	return {
		entries: resp?.results as Array<ArticleEntry> | [],
		after
	};
};
