<script lang="ts">
	import { enhance } from '$app/forms';
	import { parseAuthors, parseContent, parseSources } from '$lib/parse';
	import { formatISODate } from '$lib/time';
	import type { Article } from '@michigandaily/wputils';

	export let article: Article;
	export let path: string;

	let images = parseContent(article.image, article.content);

	let index = 0;
	$: image = images[index];
</script>

<div>
	<p>
		{#if article.category.parent}
			<span class="category">
				{article.category.parent}
			</span>
		{/if}
		{#if article.category.primary}
			<span class="category">
				{article.category.primary}
			</span>
		{/if}
	</p>
	<a style="text-decoration: none; font-family: 'Lora'" href={article.permalink}>
		<p style="margin-bottom: 0.5rem; margin-top: 1rem;">
			<b>
				{@html article.title}
			</b>
		</p>
	</a>
	<p class="subtitle">
		by {parseAuthors(article.authors)}
	</p>
	<time datetime={article.date} class="subtitle">
		{formatISODate(article.date, {
			weekday: undefined,
			month: 'long',
			year: 'numeric',
			day: 'numeric'
		})}
	</time>
</div>
{#if images.length > 0}
	<div style="font-weight: 700;">
		<p
			style="float: left; color: tomato; border-radius: 50%; border: 2px solid tomato; text-align: center; width: 1.3rem; margin-right: 1rem;"
		>
			!
		</p>
		<p style="color: lightcoral; margin: 0;">
			{images.length} image{images.length > 1 ? 's' : ''} without alt text
		</p>
	</div>
{:else}
	<div style="font-weight: 700;">
		<p
			style="float: left; color: lightgreen; border-radius: 50%; border: 2px solid lightgreen; text-align: center; width: 1.3rem; margin-right: 1rem;"
		>
			✓
		</p>
		<p style="color: lightgreen; margin: 0;">All images have alt text</p>
	</div>
	<form method="POST" action="?/update" use:enhance>
		<input name="id" type="hidden" value={article.id} />
		<input name="path" type="hidden" value={path} />
		<button class="clear">Click here to clear the article from the list</button>
	</form>
{/if}

<div
	style="position: relative; display: flex; flex-flow: column nowrap; align-items: center; gap: 10px;"
>
	<img srcset={parseSources(image)} loading="lazy" alt="" />
	{#if images.length > 1}
		<button class="arrow left" on:click={() => index--} disabled={index === 0}>←</button>
		<button class="arrow right" on:click={() => index++} disabled={index === images.length - 1}>
			→
		</button>
		<p>{index + 1}/{images.length}</p>
	{/if}
</div>

<style>
	img {
		width: min(700px, 100%);
		max-height: 250px;
		object-fit: contain;
	}
	p {
		margin: 0;
	}
	b {
		font-size: 1.2rem;
	}
	.category {
		background: rgb(25, 39, 73);

		color: white;
		font-size: 12px;
		font-weight: 700;
		text-transform: uppercase;

		padding: 0.5rem;
	}
	.subtitle {
		font-size: 15px;
		color: var(--secondary-text-color-theme);
	}
	.arrow {
		position: absolute;
		top: 40%;

		aspect-ratio: 1;
		font-size: 1.5rem;
		border: 1px solid var(--text-color-theme);

		color: var(--text-color-theme);
		background: var(--primary-color-theme);
	}
	.left {
		left: 0%;
	}
	.right {
		right: 0%;
	}
	.clear {
		color: lightgreen;
		text-decoration: underline;
		font-size: 16px;

		background: none;
		border: none;
	}
</style>
