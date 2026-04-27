<script lang="ts">
	import Navbutton from '$lib/components/navbutton.svelte';
	import Logo from '$lib/assets/logo-small.svg';

	import { page } from '$app/stores';
</script>

<nav>
	<ul>
		<li>
			{#if $page.url.pathname === '/'}
				<img
					class="logo"
					src={Logo}
					alt="The Michigan Daily logo"
					width="30px"
					height="30px"
					style="float: left; padding: 10px;"
				/>
				<h1>Alt Text Tracker</h1>
			{:else}
				<Navbutton route="/" title="← Back" />
			{/if}
		</li>
		<li>
			{#if $page.url.pathname === '/'}
				<Navbutton route="/posts" title="Track Specific Articles →" />
			{/if}
		</li>
	</ul>
</nav>
<main>
	<slot />
</main>

<style>
	nav {
		border-bottom: solid 1px var(--secondary-color-theme);

		padding: 0 1.5rem;
		min-height: 3.5rem;

		align-content: center;
	}

	h1 {
		font-size: 1.1rem;
	}

	ul {
		padding: 0;
		margin: 0;
		list-style: none;

		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(270px, 100%), 1fr));
	}

	li:last-child {
		place-self: center end;
	}
</style>
