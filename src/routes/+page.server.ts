import type { PageServerLoad } from './$types';
import type { ArticleEntry } from '$lib/types';
import { lastMonth } from '$lib/time';

export const load: PageServerLoad = async ({ platform, url }) => {
	const after = url.searchParams.get('after') ??  lastMonth.toISOString().split('T')[0];

	const resp = await platform?.env.DB.prepare(
		'SELECT date, images_published, images_published_with_alt_text, categories FROM articles WHERE date > ?'
	).bind(after).all();

	return {
		entries: resp?.results as Array<ArticleEntry> | [],
		after 
	};
};
