import type { PageServerLoad } from './$types';
import type { ArticleEntry } from '$lib/types';

export const load: PageServerLoad = async ({ platform }) => {
	const resp = await platform?.env.DB.prepare(
		'SELECT date, images_published, images_published_with_alt_text, categories FROM articles WHERE date > "2022-12-31" ORDER BY date ASC'
	).all();

	return {
		entries: resp?.results as Array<ArticleEntry> | []
	};
};
