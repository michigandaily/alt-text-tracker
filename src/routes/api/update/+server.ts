import { parseContent } from '$lib/parse.js';
import type { Article } from '$lib/types.js';

import { error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const PUT: RequestHandler = async ({ request, platform }) => {
	const { id }: { id: number } = await request.json();
    
	const images_without_alt_text: number = await fetch(
		`https://michigandaily.com/wp-json/tmd/v1/posts/?ids=${id}&content=true&image=true`
	)
		.then((resp) => {
			if (!resp.ok) {
				throw Error(`${resp.status} ${resp.statusText}`);
			}
			return resp.json() as Promise<Array<Article>>;
		})
		.then((data) => {
			return parseContent(data[0].image, data[0].content).length;
		})
		.catch((msg) => {
			error(400, msg);
		});

	await platform?.env.DB.prepare(
		`UPDATE articles 
        SET images_published_with_alt_text = images_published - ? 
        WHERE aid == ? `
	)
		.bind(images_without_alt_text, id)
		.run();

	return new Response(null, { status: 204 });
};
