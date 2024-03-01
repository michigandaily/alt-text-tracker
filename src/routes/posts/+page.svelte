<script lang="ts">
	import type { DateEntry, Article } from '$lib/types';

	export let data:{entries: Array<DateEntry>}|null;

</script>
<section style="max-width: 1200px; margin: 0 auto; padding-left: 1rem;">
	<h3>Recent Articles without Alt Text</h3>
	<ul>
		<!-- {#each articles as article}
		<li>
			<p>{article.title}</p>
		</li>
		{/each} -->
	</ul>
</section>
<style>
	ul {
		list-style: none;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(350px, 100%), 1fr));

		place-items: center;
	}

	li {
		aspect-ratio: 2/3
	}
</style>

