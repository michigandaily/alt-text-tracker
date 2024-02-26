<script lang="ts">
	export let route: string;
	export let title: string;
</script>

<a class="navbutton" href={route}>
	{title}
</a>

<style lang="scss">
	.navbutton {
		font-size: 14px;
		width: 12rem;
		aspect-ratio: 6/1;

		color: inherit;
		text-decoration-line: none;
		border: 2px solid lightskyblue;
		border-radius: 1rem;
		background: rgb(235, 235, 235);

		display: grid;
		place-items: center;
	}
	@media (prefers-color-scheme: dark) {
		.navbutton {
			background: rgb(56, 56, 56);
		}
	}
</style>
