import type { PageServerLoad } from './$types';
import type { Article, DateEntry } from '$lib/types';

export const load: PageServerLoad = async ({ parent, url }) => {
	let { entries }: { entries: Array<DateEntry> } = await parent();
	entries = entries.filter((entry: DateEntry) => entry.article_ids.length !== 0);

	const page = (entries.length ?? 0) - parseInt(url.searchParams.get('page') ?? '0');

	const ids = entries
		?.slice(page - 5, page)
		.map((entry) => entry.article_ids)
		.flat();

	const articles: Array<Article> = await fetch(
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
		});

	return {
		articles
	};
};
