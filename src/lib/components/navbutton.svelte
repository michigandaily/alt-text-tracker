<script lang="ts">
	export let route: string;
	export let title: string;

	export let preload_data: string = 'hover';
	export let preload_code: string = 'hover';
</script>

<a
	data-sveltekit-preload-data={preload_data}
	data-sveltekit-preload-code={preload_code}
	class="navbutton"
	href={route}
>
	{title}
</a>

<style>
	.navbutton {
		font-size: 1rem;
		width: 12rem;
		aspect-ratio: 6/1;

		color: inherit;
		border-radius: 1rem;

		display: grid;
		place-items: center;
	}
</style>
