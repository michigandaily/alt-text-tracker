<script lang="ts">
	export let data;
	let articles = data.articles;
</script>
<section style="max-width: 1200px; margin: 0 auto; ">
	<h3>Recent Articles without Alt Text</h3>
	<ul>
		{#each articles as article}
		<li>
			<a href={article.permalink}>
				<b>
					{article.title.replace("<strong>", "").replace("</strong>", "")}
				</b>
			</a>
			
			
		</li>
		{/each}
	</ul>
</section>
<style>
	ul {
		list-style: none;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(350px, 100%), 1fr));

		place-items: center;

		gap: 15px;
		padding: 15px;;
	}

	li {
		display: grid;
		box-sizing: border-box;
		padding: 10px;
		

		aspect-ratio: 2/3;
		width: 100%;
		border-radius: 10px;
		place-items: center;

		background: var(--secondary-color-theme);
	}
</style>

