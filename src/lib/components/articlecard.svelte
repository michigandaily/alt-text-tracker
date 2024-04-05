<script lang="ts">
	import { enhance } from '$app/forms';
	import { parseContent, parseSources } from '$lib/parse';
	import type { Article } from '$lib/types';

	export let article: Article;
	export let path: string;

	let images = parseContent(article.image, article.content);

	let index = 0;
	$: image = images[index];
</script>

<a href={article.permalink}>
	<p>
		<b>
			{@html article.title}
		</b>
	</p>
</a>
<div style="display: flex; flex-flow: column nowrap; align-items: center; gap: 10px;">
	<img srcset={parseSources(image)} loading="lazy" alt="" />
	{#if images.length > 1}
		<div>
			<button class="arrow" on:click={() => index--} disabled={index === 0}>←</button>
			<button class="arrow" on:click={() => index++} disabled={index === images.length - 1}>
				→
			</button>
		</div>
		{index + 1}/{images.length}
	{/if}
	{#if images.length > 0}
		<p style="color: lightcoral; margin: 0;">
			{images.length} image{images.length > 1 ? 's' : ''} without alt text
		</p>
	{:else}
		<p style="color: lightgreen; margin: 0;">All images have alt text</p>
	{/if}
</div>
<p>{article.date.split('T')[0]}</p>
{#if images.length == 0}
	<form method="POST" action="?/update" use:enhance>
		<input name="id" type="hidden" value={article.id} />
		<input name="path" type="hidden" value={path} />
		<button class="clear">clear</button>
	</form>
{/if}

<style>
	img {
		width: min(700px, 100%);
		max-height: 275px;
		object-fit: contain;
	}
	.arrow {
		aspect-ratio: 1;
		font-size: 1.5rem;
		border: 1px solid var(--text-color-theme);

		color: var(--text-color-theme);
		background: var(--primary-color-theme);
	}
	.clear {
		color: white;
		background: rgb(83, 158, 255);

		font-size: 16px;
		padding: 5px;
		border: 1px solid var(--text-color-theme);
	}
</style>