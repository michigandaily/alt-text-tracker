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

import type { Article, Block, Image, ArticleEntry, PostsQuery } from './types';

function parseImageData(
	aid: number,
	image: Image,
	image_data: Record<string, ArticleEntry>
) {
	image_data[aid].images_published += 1;

	// If image contains alt text, add to images with alt text count, as well as the corresponding
	// category specific counts
	if (image && image.alt && image.alt.length > 0) {
		image_data[aid].images_published_with_alt_text += 1;
	} 
}

function parseBlockData(
	aid: number,
	block: Block,
	image_data: Record<string, ArticleEntry>
) {
	if (block.blockName == 'core/image' && !Array.isArray(block.data)) {
		parseImageData(aid, block.data, image_data);
	} else if (block.blockName == 'core/gallery') {
		block.innerBlocks.forEach((block) => {
			if (block.blockName === 'core/image' && !Array.isArray(block.data)) {
				parseImageData(aid, block.data, image_data);
			}
		});
	} else if (
		(block.blockName == 'jetpack/tiled-gallery' || block.blockName == 'jetpack/slideshow') &&
		Array.isArray(block.data)
	) {
		block.data.forEach((image: Image) => {
			parseImageData(aid, image, image_data);
		});
	} else if (block.blockName == 'jetpack/image-compare' && Array.isArray(block.data)) {
		block.data.forEach((image: Image) => {
			parseImageData(aid, image, image_data);
		});
	} else if (block.blockName == 'core/columns' || block.blockName == 'core/column' || block.blockName == 'core/group') {
		block.innerBlocks.forEach((block) => parseBlockData(aid, block, image_data));
	}
}

function parseArticleData(post: Article, image_data: Record<string, ArticleEntry>) {
	const [date] = post.date.split('T');

	image_data[post.id] = {
		date,
		images_published: 0,
		images_published_with_alt_text: 0,
		categories: post.categories,
	}

	// Add featured image data
	parseImageData(post.id, post.image, image_data);

	// Parse images within the article itself
	post.content.forEach((block: Block) => {
		parseBlockData(post.id, block, image_data);
	});
}

async function parsePostQuery(page: number, after: string, image_data: Record<string, ArticleEntry>) {
	let total_pages: number = 1;
	await fetch(
		`https://www.michigandaily.com/wp-json/tmd/v1/posts_query/?num_posts=200&page=${page}&after=${after}`
	)
		.then((resp) => {
			if (!resp.ok) {
				throw new Error(`${resp.status}: ${resp.statusText}`);
			}

			return resp.json() as Promise<PostsQuery>;
		})
		.then((query) => {
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
	async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
		const image_data: Record<string, ArticleEntry> = {};

		// Get the date of the latest entry, and start fetching data at the date
		const DB_resp: Record<string, string> | null = await env.DB.prepare(
			`SELECT MAX(date) FROM articles`
		).first();

		const after: string = DB_resp ? DB_resp['MAX(date)'] ?? '2022-12-31' : '2022-12-31';

		const total_pages = await parsePostQuery(0, after, image_data);
		
		for (let i = 1; i < total_pages; ++i) {
			await parsePostQuery(i, after, image_data);
		}

		// Batch insert/update all date entries
		const stmt = env.DB.prepare(
			`INSERT OR IGNORE INTO articles
			(aid, date, images_published, images_published_with_alt_text, categories) VALUES
			(?, ?, ?, ?, ?)`
		);

		const batchUpdate: Array<D1PreparedStatement> = [];

		Object.keys(image_data).forEach((aid) => {
			const entry: ArticleEntry = image_data[aid];
			batchUpdate.push(
				stmt.bind(
					aid,
					entry.date,
					entry.images_published,
					entry.images_published_with_alt_text,
					JSON.stringify(entry.categories),
				)
			);
		});

		const info = await env.DB.batch(batchUpdate);
		console.log(info);
	}
};
