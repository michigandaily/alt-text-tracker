import type { ArticleEntry } from './types';

export async function sendReport(
	url: string,
	options: { date: string; data: Record<string, ArticleEntry> }
) {
	const blocks = formatBlock(options.date, options.data);
	const attachments = formatAttachment(options.date, options.data);

	const body = blocks ? { blocks, attachments } : { attachments };

	if (attachments) {
		const resp = await fetch(url, {
			method: 'POST',
			body: JSON.stringify(body),
			headers: { 'Content-Type': 'application/json' }
		})
			.then((resp) => resp.text())
			.catch((error) => {
				return error;
			});

		return resp;
	}
	return JSON.stringify({ message: 'No data found.' });
}

function formatBlock(date: string, data: Record<string, ArticleEntry>) {
	const data_all = Object.values(data).filter((a) => a.date === date);
	const data_without_alt_text = data_all.filter(
		(a) => a.images_published !== a.images_published_with_alt_text
	);
	const images_without_alt_text = data_without_alt_text.reduce(
		(sum, a) => sum + a.images_published,
		0
	);

	if (images_without_alt_text <= 20) {
		return false;
	}

	return [
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: `<!channel> ⚠️ *Action Recommended:* More than 20 images from <!date^${(new Date(date).getTime() + 5 * 60 * 60 * 1000) / 1000}^{date_pretty}|${date}> do not have alt text.`
			}
		}
	];
}

function formatAttachment(date: string, data: Record<string, ArticleEntry>) {
	const data_all = Object.values(data).filter((a) => a.date === date);
	const data_without_alt_text = data_all.filter(
		(a) => a.images_published !== a.images_published_with_alt_text
	);
	const images_without_alt_text = data_without_alt_text.reduce(
		(sum, a) => sum + a.images_published,
		0
	);

	if (data_all.length === 0) {
		return false;
	}

	return [
		{
			color:
				images_without_alt_text === 0
					? '#90EE90'
					: images_without_alt_text < 5
						? '#FFDC73'
						: images_without_alt_text < 10
							? '#FFA500'
							: '#FF6347',
			blocks: [
				{
					type: 'section',
					text: {
						type: 'mrkdwn',
						text: `*On <https://michigan-daily-alt-text-tracker.pages.dev/posts/?start=${date}&end=${date}|${new Date(
							new Date(date).getTime() +
							5 * 60 * 60 * 1000
						).toLocaleDateString('en-us', {
							weekday: 'long',
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})}>*`
					}
				},
				{
					type: 'section',
					text: {
						type: 'mrkdwn',
						text:
							`📝 *${data_all.length}* articles were published. Of those, *${data_without_alt_text.length}* articles are in need of alternative text.` +
							`\n🖼️ *${data_all.reduce((sum, a) => sum + a.images_published, 0)}* images were published. Of those, *${images_without_alt_text}* images are in need of alternative text.`
					}
				},
				{
					type: 'context',
					elements: [
						{
							type: 'mrkdwn',
							text: `_See more insights at https://michigan-daily-alt-text-tracker.pages.dev_`
						}
					]
				},
				{
					type: 'divider'
				}
			]
		}
	];
}
