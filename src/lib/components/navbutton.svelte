<script lang="ts">
	export let route: string;
	export let title: string;
</script>

<a class="navbutton" href={route}>
	{title}
</a>

<style>
	.navbutton {
		font-size: 14px;
		width: 12rem;
		aspect-ratio: 6/1;

		color: inherit;
		text-decoration-line: none;
		border: 2px solid lightskyblue;
		border-radius: 1rem;
		background: var(--secondary-color-theme);

		display: grid;
		place-items: center;
	}
</style>
