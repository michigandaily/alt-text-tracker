<script lang="ts">
	import * as d3 from 'd3';
	import StackedBarChart from '$lib/components/stackedbarchart.svelte';
	import LineGraph from '$lib/components/linegraph.svelte';

	export let data;
	let entries = data?.entries;

	$: timerange = all;
	$: category = null;

	const lastWeek = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
	const lastMonth = new Date(new Date().getTime() - 7 * 4 * 24 * 60 * 60 * 1000);
	const lastSixMonths = new Date(new Date().getTime() - 7 * 4 * 24 * 60 * 60 * 1000 * 6);
	const lastYear = new Date(new Date().getTime() - 365 * 24 * 60 * 60 * 1000);
	const all = new Date('2022-12-31');

	$: innerWidth = 1300;
	$: innerHeight = 600;
	$: width = innerWidth / 1.075;
	$: height = innerHeight / 1.75;

	$: tidy = entries.filter(
		(entry) =>
			new Date(entry.date) >= timerange && (category ? entry.categories.includes(category) : true)
	);

	$: index = d3.rollup(
		tidy,
		(v) => ({
			articles_published: v.length,
			articles_published_with_alt_text: v.filter(
				(a) => a.images_published === a.images_published_with_alt_text
			).length,
			images_published: d3.sum(v.map((a) => a.images_published)),
			images_published_with_alt_text: d3.sum(v.map((a) => a.images_published_with_alt_text)),
			categories: d3.union(v.map((a) => a.categories.split(',')).flat())
		}),
		(d) => d.date
	);
</script>

<svelte:window bind:innerHeight bind:innerWidth />

<main>
	<section>
		<h2>Tracking The Daily's alternative text</h2>
		<p>
			The Daily has been tracking the number of images published with and without alternative text
			since December 2022. The chart below shows the number of images published with and without
			alternative text each day.
		</p>
		<div class="options">
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
			<div>
				<label for="timerange">Select timerange:</label>
				<select bind:value={timerange}>
					<option value={all}></option>
					<option value={lastWeek}>Last week</option>
					<option value={lastMonth}>Last month</option>
					<option value={lastSixMonths}>Last six months</option>
					<option value={lastYear}>Last year</option>
				</select>
			</div>
			<div>
				<label for="category">Select category:</label>
				<select bind:value={category}>
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
		</div>
	</section>
	<StackedBarChart {width} {height} {index} />
	<LineGraph {width} {height} {index} />
</main>

<style>
	h2 {
		font-size: 1.25rem;
	}

	.options {
		display: grid;
		place-items: center;
		grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
		gap: 10px;
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

	select {
		display: inline-block;
		padding: 5px;

		font-size: 16px;
		width: 200px;

		color: var(--text-color-theme);
		background: var(--secondary-color-theme);
	}

	main {
		padding: 2rem;
	}
</style>
