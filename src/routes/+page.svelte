<script lang="ts">
	import { goto } from '$app/navigation';

	import * as d3 from 'd3';
	import StackedBarChart from '$lib/components/stackedbarchart.svelte';
	import LineGraph from '$lib/components/linegraph.svelte';

	import { lastWeek, lastMonth, lastSixMonths, lastYear, all } from '$lib/time.js';

	export let data;
	$: console.log("D1 Cached Status:", data.cached);
	$: console.log("Production: ", data.production)

	$: entries = data.entries;

	let timerange = data.after ? new Date(data.after) : lastMonth;
	$: category = null;

	$: innerWidth = 1300;
	$: innerHeight = 600;
	$: width = innerWidth / 1.075;
	$: height = innerHeight / 1.75;

	$: tidy = entries.filter(
		(entry) =>
			new Date(entry.date) >= timerange &&
			(category ? JSON.parse(entry.categories).includes(category) : true)
	);

	$: index = d3.rollup(
		tidy,
		(v) => ({
			articles_published: v.length,
			articles_published_with_alt_text: v.filter(
				(a) => a.images_published === a.images_published_with_alt_text
			).length,
			images_published: d3.sum(v, (a) => a.images_published),
			images_published_with_alt_text: d3.sum(v, (a) => a.images_published_with_alt_text),
			categories: d3.union(v.map((a) => JSON.parse(a.categories)).flat())
		}),
		(d) => d.date
	);

	$: [earliest, _] = d3.extent(entries, (d) => new Date(d.date)) as Iterable<Date>;
</script>

<svelte:window bind:innerHeight bind:innerWidth />

<main>
	<section>
		<h2>Tracking The Daily's alternative text</h2>
		<p>
			The Daily has been tracking the number of images published with and without alternative text
			since December 2022. The charts below respectively shows the number of images published with
			and without alternative text each day, and the running average percent of images published
			with alternative text.
		</p>
		<div class="options">
			<div>
				<label for="timerange">Select timerange:</label>
				<select
					id="timerange"
					bind:value={timerange}
					on:change={() => {
						if (earliest.getTime() > timerange.getTime()) {
							goto(`/?after=${timerange.toISOString().split('T')[0]}`, { invalidateAll: true });
						}
						goto(`/?after=${timerange.toISOString().split('T')[0]}`);
					}}
				>
					<option value={all}></option>
					<option value={lastWeek}>Last week</option>
					<option value={lastMonth}>Last month</option>
					<option value={lastSixMonths}>Last six months</option>
					<option value={lastYear}>Last year</option>
				</select>
			</div>
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
		</div>
	</section>
	<section>
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
		<StackedBarChart {width} {height} {index} {category} />
	</section>
	<section>
		<div class="legend">
			<div class="legend-item">
				<div style="background-color: steelblue;"></div>
				<span>Running average percentage of images published with alternative text</span>
			</div>
		</div>
		<LineGraph {width} {height} {index} />
	</section>
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

	.legend {
		padding: 8px;
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
		display: grid;
		gap: 1rem;
		padding: 2rem;
	}
</style>
