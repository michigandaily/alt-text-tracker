import type { PageServerLoad } from './$types';
import type { Article, DateEntry } from '$lib/types';

export const load: PageServerLoad = async ({ parent, url }) => {
	let { entries }: { entries: Array<DateEntry> } = await parent();
	entries = entries.filter((entry: DateEntry) => entry.article_ids.length !== 0);

	const page = parseInt(url.searchParams.get('page') ?? '0')
	const offset = (entries.length ?? 0) - page * 5;

	const ids = entries
		?.slice(offset - 5, offset)
		.map((entry) => entry.article_ids)
		.flat().reverse();

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
		articles,
		page
	};
};
