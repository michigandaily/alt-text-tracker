<script lang="ts">
	import ImagePages from '$lib/components/imagepages.svelte';
	import { parseContent } from '$lib/parse';

	export let data;
</script>

<section style="max-width: 1200px; margin: 0 auto; ">
	<h3>Recent Articles without Alt Text</h3>
	<ul>
		{#each data.articles as article}
			<li>
				<a href={article.permalink}>
					<p>
						<b>
							{@html article.title}
						</b>
					</p>
				</a>
				<ImagePages images={parseContent(article.image, article.content)} />
				<p>{article.date.split('T')[0]}</p>
			</li>
		{/each}
	</ul>
</section>
<footer
	style="display: flex; justify-content: center; gap: 15px; padding: 1rem; font-size: 1.25rem;"
>
	{#if data.page > 0}
		<a href={`/posts/?page=${data.page - 1}`}>← Back</a>
	{/if}
	{#if data.articles.length > 0}
		<a href={`/posts/?page=${data.page + 1}`}>Next →</a>
	{/if}
</footer>

<style>
	ul {
		list-style: none;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(350px, 100%), 1fr));

		place-items: center;

		gap: 15px;
		padding: 15px;
	}

	li {
		display: grid;
		box-sizing: border-box;
		padding: 10px;

		aspect-ratio: 2/2.75;
		width: 100%;
		border-radius: 10px;
		place-items: center;
		place-content: center;

		background: var(--secondary-color-theme);
	}
</style>
