import type { PageServerLoad } from './$types';
import type { Article } from '$lib/types';

export const load: PageServerLoad = async ({ platform, url }) => {
	const page = parseInt(url.searchParams.get('page') ?? '0');
	const category = url.searchParams.get('category')
		? parseInt(url.searchParams.get('category') as string)
		: null;
	const start = url.searchParams.get('start') ?? '2022-12-31';
	const end = url.searchParams.get('end') ?? new Date().toISOString().split('T')[0];

	const response = await platform?.env.DB.prepare(
		`SELECT aid FROM articles
		WHERE images_published_with_alt_text != images_published 
		${category ? `AND categories LIKE "%${category}%"` : ''}
		AND date >= "${start}" AND date <= "${end}"
		ORDER BY date DESC LIMIT ${page * 18}, 18`
	).all();

	const ids =
		response?.results.map(
			(resp: Array<{ aid: number }> | unknown) => (resp as { aid: number }).aid
		) ?? [];

	const articles: Array<Article> =
		ids.length > 0
			? await fetch(
					`https://michigandaily.com/wp-json/tmd/v1/posts/?ids=${ids}&content=true&image=true`
				)
					.then((resp) => {
						if (!resp.ok) {
							throw Error(`${resp.status} ${resp.statusText}`);
						}

						return resp.json() as Promise<Array<Article>>;
					})
					.then((data) => {
						return data;
					})
					.catch((error) => {
						console.error(error);
						return [];
					})
			: [];

	return {
		articles,
		page,
		category,
		start,
		end
	};
};
