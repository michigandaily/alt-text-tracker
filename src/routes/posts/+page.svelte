<script lang="ts">
	import ArticleCard from '$lib/components/articlecard.svelte';

	export let data;

	let category = data.category ?? null;
	let start = data.start ?? null;
	let end = data.end ?? null;
</script>

<section style="max-width: 1200px; margin: 0 auto; ">
	<h1>Recent Articles without Alt Text</h1>
	<div
		style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 3rem;"
	>
		<div>
			<label for="category">Select category:</label>
			<select id="category" bind:value={category}>
				<option value={null}>All</option>
				<option value={46}>News</option>
				<option value={44}>Sports</option>
				<option value={31}>Opinion</option>
				<option value={5}>Arts</option>
				<option value={55}>Statement</option>
				<option value={32}>MiC</option>
				<option value={124}>Photos</option>
				<option value={24}>Podcasts</option>
				<option value={10327}>Videos</option>
			</select>
		</div>
		<div>
			<label for="start"
				>From
				<input id="start" type="date" bind:value={start} />
			</label>
			<label for="end">
				to
				<input id="end" type="date" bind:value={end} />
			</label>
		</div>
		<a
			id="apply"
			data-sveltekit-preload-data="false"
			data-sveltekit-preload-code="false"
			href={`posts?page=${data.page}
				${category ? `&category=${category}` : ''}
				${start ? `&start=${start}` : ''}
				${end ? `&end=${end}` : ''}`}
		>
			Apply Filter
		</a>
	</div>

	<nav
		style="display: flex; justify-content: center; gap: 15px; padding: 1rem; font-size: 1.25rem;"
	>
		{#if data.page > 0}
			<a
				data-sveltekit-preload-data="false"
				data-sveltekit-preload-code="false"
				href={`/posts/?page=${data.page - 1}
				${category ? `&category=${data.category}` : ''}
				${start ? `&start=${data.start}` : ''}
				${end ? `&end=${data.end}` : ''}`}>← Back</a
			>
		{/if}
		{#if data.articles.length === 18}
			<a
				data-sveltekit-preload-data="false"
				data-sveltekit-preload-code="false"
				href={`/posts/?page=${data.page + 1}
				${category ? `&category=${data.category}` : ''}
				${start ? `&start=${data.start}` : ''}
				${end ? `&end=${data.end}` : ''}`}>Next →</a
			>
		{/if}
	</nav>
	<ul>
		{#each data.articles as article (article.id)}
			<li>
				<ArticleCard
					{article}
					path={`/posts/?page=${data.page}
					${category ? `&category=${data.category}` : ''}
					${start ? `&start=${data.start}` : ''}
					${end ? `&end=${data.end}` : ''}`}
				/>
			</li>
		{:else}
			<div style="text-align: center; grid-column: span 3;">
				<h2>No More Articles</h2>
				<p>You've reached the end of the list!</p>
			</div>
		{/each}
	</ul>
</section>
<nav style="display: flex; justify-content: center; gap: 15px; padding: 1rem; font-size: 1.25rem;">
	{#if data.page > 0}
		<a
			data-sveltekit-preload-data="false"
			data-sveltekit-preload-code="false"
			href={`/posts/?page=${data.page - 1}
			${category ? `&category=${data.category}` : ''}
			${start ? `&start=${data.start}` : ''}
			${end ? `&end=${data.end}` : ''}`}>← Back</a
		>
	{/if}
	{#if data.articles.length === 18}
		<a
			data-sveltekit-preload-data="false"
			data-sveltekit-preload-code="false"
			href={`/posts/?page=${data.page + 1}
			${category ? `&category=${data.category}` : ''}
			${start ? `&start=${data.start}` : ''}
			${end ? `&end=${data.end}` : ''}`}>Next →</a
		>
	{/if}
</nav>

<style>
	input,
	select {
		display: inline-block;
		padding: 5px;

		font-size: 16px;
		width: 200px;

		color: var(--text-color-theme);
		border: 0.5px solid var(--text-color-theme);
		background: var(--secondary-color-theme);
	}

	#apply {
		box-sizing: border-box;
		padding: 0.75rem;

		font-size: 1rem;
		border: 1px solid var(--text-color-theme);

		color: var(--text-color-theme);
		background: var(--secondary-color-theme);
	}

	ul {
		list-style: none;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(350px, 100%), 1fr));

		gap: 15px;
		padding: 15px;
	}

	li {
		display: grid;
		box-sizing: border-box;
		padding: 1.2rem;

		place-content: start;
		gap: 1.5rem;

		aspect-ratio: 2/3;
		width: 100%;
		border-radius: 10px;

		background: var(--secondary-color-theme);
	}
</style>
