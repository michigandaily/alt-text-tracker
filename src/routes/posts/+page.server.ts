import type { PageServerLoad } from './$types';
import type { Article } from '$lib/types';

export const load: PageServerLoad = async ({ platform, url }) => {
	const page = parseInt(url.searchParams.get('page') ?? '0');

	const response = await platform?.env.DB.prepare(
		`SELECT article_ids FROM date_entries 
		WHERE LENGTH(article_ids) > 0
		ORDER BY date DESC LIMIT ${page * 5}, 5`
	).all();

	const ids =
		response?.results
			.map((resp: Array<{ article_ids: string }> | unknown) =>
				(resp as { article_ids: string }).article_ids.split(',')
			)
			.flat()
			.filter((id) => id) ?? [];

	const articles: Array<Article> =
		ids.length > 0
			? await fetch(
					`https://michigandaily.com/wp-json/tmd/v1/posts/?ids=${ids}&content=true&image=true`
				)
					.then((resp) => {
						if (!resp.ok) {
							throw Error(`${resp.status} ${resp.statusText}`);
						}

						return resp.json();
					})
					.then((data: Array<Article> | unknown) => {
						return data as Array<Article>;
					})
					.catch((error) => {
						console.error(error);
						return [];
					})
			: [];

	return {
		articles,
		page
	};
};
