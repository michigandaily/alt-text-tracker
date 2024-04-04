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

import type { Article, Block, Image, ArticleEntry, PostsQuery, SlackBlock } from './types';

function getAttachment(date: string, today: string, image_data: Record<string, ArticleEntry>) {
	const data_all = Object.values(image_data).filter((a) => a.date === date);
	const data_without_alt_text = data_all.filter(
		(a) => a.images_published !== a.images_published_with_alt_text
	);

	if (data_all.length === 0) {
		return false;
	}

	const attachment: { color: string; blocks: Array<SlackBlock> } = {
		color: data_without_alt_text.length === 0 ? '#90EE90' : '#FF6347',
		blocks: [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: `*On <https://michigan-daily-alt-text-tracker.pages.dev/posts/?start=${date}&end=${date}|${new Date(date).toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}>*\n📝 *${data_all.length}* articles were published. Of those, *${data_without_alt_text.length}* articles are in need of alternative text.\n🖼️ *${data_all.reduce((sum, a) => sum + a.images_published, 0)}* images were published. Of those, *${data_without_alt_text.reduce((sum, a) => sum + a.images_published, 0)}* images are in need of alternative text.`
				}
			}
		]
	};

	if (date === today) {
		attachment.blocks.push({
			type: 'context',
			elements: [
				{
					type: 'mrkdwn',
					text: `_Note: Incomplete data. Wait for tomorrow for a full report on today's alt text._`
				}
			]
		},
		{
			type: 'divider'
		});
	} else {
		attachment.blocks.push({
			type: 'divider'
		});
	}

	return attachment;
}

function parseImageData(aid: number, image: Image, image_data: Record<string, ArticleEntry>) {
	image_data[aid].images_published += 1;

	if (image && image.alt && image.alt.length > 0) {
		image_data[aid].images_published_with_alt_text += 1;
	}
}

function parseBlockData(aid: number, block: Block, image_data: Record<string, ArticleEntry>) {
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
	} else if (
		block.blockName == 'core/columns' ||
		block.blockName == 'core/column' ||
		block.blockName == 'core/group'
	) {
		block.innerBlocks.forEach((block) => parseBlockData(aid, block, image_data));
	}
}

function parseArticleData(post: Article, image_data: Record<string, ArticleEntry>) {
	const [date] = post.date.split('T');

	image_data[post.id] = {
		date,
		images_published: 0,
		images_published_with_alt_text: 0,
		categories: post.categories
	};

	// Add featured image data
	parseImageData(post.id, post.image, image_data);

	// Parse images within the article itself
	post.content.forEach((block: Block) => {
		parseBlockData(post.id, block, image_data);
	});
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
	PRODUCTION: boolean;
	SLACK_WEBHOOK: string;
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
					JSON.stringify(entry.categories)
				)
			);
		});

		const info = await env.DB.batch(batchUpdate);

		if (env.PRODUCTION) {
			const [today] = new Date().toISOString().split('T');
			const [yesterday] = new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
				.toISOString()
				.split('T');

			const dates = [yesterday, today];
			const attachments = dates.map((date) => getAttachment(date, today, image_data)).filter((field) => field);

			const resp = await fetch(env.SLACK_WEBHOOK, {
				method: 'POST',
				body: JSON.stringify({
					blocks: [
						{
							type: 'header',
							text: {
								type: 'plain_text',
								text: `Daily Report - ${today}`
							}
						}
					],
					attachments
				}),
				headers: { 'Content-Type': 'application/json' }
			})
				.then((resp) => resp.text())
				.catch((error) => {
					console.error(error);
				});

			console.log(resp);
		}

		console.log(info);
	}
};
