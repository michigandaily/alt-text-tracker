<script lang="ts">
	import Navbutton from '$lib/components/navbutton.svelte';
	import type { DateEntry } from '$lib/types';

	import logo from '$lib/assets/logo-small.svg';

	import { csv } from 'd3-fetch';
	import { autoType } from 'd3-dsv';
	import { rollup } from 'd3-array';
	import { select } from 'd3-selection';
	import { axisBottom } from 'd3-axis';
	import { scaleOrdinal } from 'd3-scale';

	const main = async () => {
		const data = await csv(
			'https://raw.githubusercontent.com/MichiganDaily/alt-text-tracker/main/data.csv',
			autoType
		);

		const tidy = data
			.map((d) => [
				{
					date: d.date,
					status: 'Images published with alternative text',
					value: d.images_published_with_alt_text
				},
				{
					date: d.date,
					status: 'Images published without alternative text',
					value: d.images_published - d.images_published_with_alt_text
				}
			])
			.flat();

		const index = rollup(
			tidy,
			(v) => Object.fromEntries(v.map((o) => [o.status, o.value])),
			(d) => d.date
		);

		const height = 500;

		const color = scaleOrdinal()
			.domain([
				'Images published with alternative text',
				'Images published without alternative text'
			])
			.range(['lightgreen', 'LightCoral']);
	};

	main();
</script>

<nav>
	<ul>
		<li>
			<img
				src={logo}
				alt="The Michigan Daily logo"
				width="50px"
				height="50px"
				style="float: left; padding: 10px;"
			/>
			<h1>Alt Text Tracker</h1>
		</li>
		<li>
			<Navbutton route="/posts" title="Track Specific Articles →" />
		</li>
	</ul>
	<hr />
</nav>
<main>
	<h2>Tracking The Daily's alternative text</h2>
	<p>
		The Daily has been tracking the number of images published with and without alternative text
		since December 2022. The chart below shows the number of images published with and without
		alternative text each day.
	</p>
	<p>
		Hover over each column for more information:
		<span id="column-information"></span>
	</p>
	<div class="legend">
		<div class="legend-item">
			<div style="background-color: lightgreen"></div>
			<span>Images published with alternative text</span>
		</div>
		<div class="legend-item">
			<div style="background-color: LightCoral"></div>
			<span>Images published without alternative text</span>
		</div>
	</div>
	<figure></figure>
</main>

<style>
	.x-axis .tick text {
		display: none;
	}

	.x-axis .tick:first-of-type text,
	.x-axis .tick:last-of-type text {
		display: block;
	}

	h2 {
		font-size: 1.25rem;
	}

	figure {
		margin: 0;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.85rem;
	}

	.legend-item div {
		width: 1rem;
		height: 1rem;
		display: inline-block;
	}

	ul {
		list-style: none;

		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(270px, 100%), 1fr));
	}

	li:last-child {
		place-self: center end;
		padding: 10px;
	}

	main {
		padding: 2rem;
	}
</style>
