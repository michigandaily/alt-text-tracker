/**
 * Welcome to Cloudflare Workers!
 *
 * This is a template for a Scheduled Worker: a Worker that can run on a
 * configurable interval:
 * https://developers.cloudflare.com/workers/platform/triggers/cron-triggers/
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import type { Article, Block, Image, DateEntry, PostsQuery } from './types';

function parseImageData(
	post: Article,
	date: string,
	image: Image,
	image_data: Record<string, DateEntry>
) {
	image_data[date].images_published += 1;

	// Check if each category exists within the category_data field. If not, initialize it.
	// If it does exist, add one to the image published count for each category it belongs to.
	post.categories.forEach((cat_id: number) => {
		if (cat_id in image_data[date].category_data) {
			image_data[date].category_data[cat_id].images_published += 1;
		} else {
			image_data[date].category_data[cat_id] = {
				images_published: 1,
				images_published_with_alt_text: 0
			};
		}
	});

	// If image contains alt text, add to images with alt text count, as well as the corresponding
	// category specific counts
	if (image && image.alt && image.alt.length > 0) {
		image_data[date].images_published_with_alt_text += 1;
		post.categories.forEach((cat_id: number) => {
			image_data[date].category_data[cat_id].images_published_with_alt_text += 1;
		});
	} else if (!image_data[date].article_ids.includes(post.id)) {
		image_data[date].article_ids.push(post.id);
	}
}

function parseArticleData(post: Article, image_data: Record<string, DateEntry>) {
	const [date] = post.date.split('T');

	// Check if there already exists a date entry. If not, initialize one.
	// If exists, add one more published article to the article count.
	if (!(date in image_data)) {
		image_data[date] = {
			images_published: 0,
			images_published_with_alt_text: 0,
			category_data: {},
			article_ids: [],
			articles_published: 1
		};
	} else {
		image_data[date].articles_published += 1;
	}

	// Add featured image data
	parseImageData(post, date, post.image, image_data);

	// Parse images within the article itself
	post.content.forEach((block: Block) => {
		if (block.blockName == 'core/image' && !Array.isArray(block.data)) {
			parseImageData(post, date, block.data, image_data);
		} else if (block.blockName == 'core/gallery') {
			block.innerBlocks.forEach((block) => {
				if (block.blockName === 'core/image' && !Array.isArray(block.data)) {
					parseImageData(post, date, block.data, image_data);
				}
			});
		} else if (
			(block.blockName == 'jetpack/tiled-gallery' || block.blockName == 'jetpack/slideshow') &&
			Array.isArray(block.data)
		) {
			block.data.forEach((image: Image) => {
				parseImageData(post, date, image, image_data);
			});
		}
	});
}

async function parsePostQuery(page: number, after: string, image_data: Record<string, DateEntry>) {
	let total_pages: number = 1;
	await fetch(
		`https://www.michigandaily.com/wp-json/tmd/v1/posts_query/?num_posts=200&page=${page}&after=${after}`
	)
		.then((resp) => {
			if (!resp.ok) {
				throw new Error(`${resp.status}: ${resp.statusText}`);
			}

			return resp.json();
		})
		.then((data: PostsQuery | unknown) => {
			const query = data as PostsQuery;

			total_pages = query.total_pages;
			query.posts.forEach((post: Article) => {
				if (post.content) {
					parseArticleData(post, image_data);
				}
			});
		})
		.catch((error: Error) => {
			console.error('Error: Failed to fetch posts - ', error);
		});
	return total_pages;
}

export interface Env {
	DB: D1Database;
}

export default {
	// The scheduled handler is invoked at the interval set in our wrangler.toml's
	// [[triggers]] configuration.
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		const image_data: Record<string, DateEntry> = {};

		// Get the date of the latest entry, and start fetching data at the date
		const DB_resp: { date: string } | null = await env.DB.prepare(
			`SELECT MAX(date) FROM date_entries`
		).first();
		const after: string = DB_resp?.date ?? '2022-12-31';

		const total_pages = await parsePostQuery(0, after, image_data);

		//If more than one page, sequentially fetch the rest of the pages
		for (let i = 1; i < total_pages; i++) {
			await parsePostQuery(i, after, image_data);
		}

		// Batch insert/update all date entries
		const stmt = env.DB.prepare(
			`INSERT OR REPLACE INTO date_entries 
			(date, articles_published, images_published, images_published_with_alt_text, category_data, article_ids) VALUES
			(?, ?, ?, ?, ?, ?)`
		);

		const batchUpdate: Array<D1PreparedStatement> = [];

		Object.keys(image_data).forEach((date) => {
			const entry: DateEntry = image_data[date];
			batchUpdate.push(
				stmt.bind(
					date,
					entry.articles_published,
					entry.images_published,
					entry.images_published_with_alt_text,
					JSON.stringify(entry.category_data),
					entry.article_ids.toString()
				)
			);
		});

		const info = await env.DB.batch(batchUpdate);
		console.log(info);
	}
};
