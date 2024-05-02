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
					width="35px"
					height="35px"
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
		padding: 0.5rem;
		border-bottom: solid 1px var(--secondary-color-theme);
	}

	h1 {
		font-size: 1.1rem;
	}

	ul {
		margin: 0;
		list-style: none;

		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(270px, 100%), 1fr));
	}

	li:last-child {
		place-self: center end;
		padding: 10px;
	}
</style>
