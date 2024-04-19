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

import { parseArticle } from '$lib/parse';
import { D1CacheName, cacheInvalidate, url } from '$lib/storage';
import { sendReport } from './messaging';
import type { Article, Image, ArticleEntry, PostsQuery } from './types';

function addImageData(aid: number, image: Image, image_data: Record<string, ArticleEntry>) {
	image_data[aid].images_published += 1;

	if (image && image.alt && image.alt.length > 0) {
		image_data[aid].images_published_with_alt_text += 1;
	}
}

async function parsePostQuery(
	page: number,
	after: string,
	image_data: Record<string, ArticleEntry>
) {
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
				image_data[post.id] = {
					date: post.date.split('T')[0],
					images_published: 0,
					images_published_with_alt_text: 0,
					categories: post.categories
				};

				parseArticle(post.image, post.content ?? [], (i: Image) =>
					addImageData(post.id, i, image_data)
				);
			});
		})
		.catch((error: Error) => {
			console.error('Error: Failed to fetch posts - ', error);
		});
	return total_pages;
}

async function emitLog(promise: Promise<unknown>) {
	console.log(await promise);
}

interface Env {
	DB: D1Database;
	PRODUCTION: boolean;
	SLACK_WEBHOOK: string;
}

export default {
	// The scheduled handler is invoked at the interval set in our wrangler.toml's
	// [[triggers]] configuration.
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		// Get the date of the latest entry, and start fetching data at the date
		const DB_resp: Record<string, string> | null = await env.DB.prepare(
			`SELECT MAX(date) FROM articles`
		).first();
		const after: string = DB_resp ? DB_resp['MAX(date)'] ?? '2022-12-31' : '2022-12-31';

		const image_data: Record<string, ArticleEntry> = {};
		const total_pages = await parsePostQuery(0, after, image_data);
		for (let i = 1; i < total_pages; ++i) {
			await parsePostQuery(i, after, image_data);
		}

		const stmt = env.DB.prepare(
			`INSERT OR IGNORE INTO articles
			(aid, date, images_published, images_published_with_alt_text, categories) VALUES
			(?, ?, ?, ?, ?)`
		);

		// Batch insert all date entries
		ctx.waitUntil(
			emitLog(
				env.DB.batch(
					Object.entries(image_data).map(([aid, entry]) =>
						stmt.bind(
							aid,
							entry.date,
							entry.images_published,
							entry.images_published_with_alt_text,
							JSON.stringify(entry.categories)
						)
					)
				)
			)
		);

		// Send slack report
		if (env.PRODUCTION) {
			const [yesterday] = new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
				.toISOString()
				.split('T');

			ctx.waitUntil(emitLog(sendReport(env.SLACK_WEBHOOK, { date: yesterday, data: image_data })));
		}

		// Invalidate caches
		const baseUrl = env.PRODUCTION ? url : 'http://localhost:8788';
		const cache = await caches.open(D1CacheName);
		ctx.waitUntil(emitLog(cacheInvalidate([baseUrl], cache)));
	}
};
