<script lang="ts">
	import Navbutton from '$lib/components/navbutton.svelte';
	import Logo from '$lib/assets/logo-small.svg';
	import * as d3 from 'd3';
	import type { DateEntry } from '$lib/types';

	export let data:{entries: Array<DateEntry>}|null;
	let entries = data?.entries ?? [];

	const tidy = entries.map((d:DateEntry) => [
		{
			date: d.date,
			status: "Images published with alternative text",
			value: d.images_published_with_alt_text
		},
		{
			date: d.date,
			status: "Images published without alternative text",
			value: d.images_published - d.images_published_with_alt_text
		}
	]).flat()

	const index = d3.rollup(
		tidy,
		(v) => Object.fromEntries(v.map((o) => [o.status, o.value])),
		(d) => d.date
	);

	const color = d3.scaleOrdinal()
		.domain([
		"Images published with alternative text",
		"Images published without alternative text",
		])
		.range(["lightgreen", "LightCoral"]);

	const padding = 32;
	$: innerWidth = 1300;
	$: innerHeight = 600;
	$: width = innerWidth / 1.1;
	$: height = innerHeight / 1.75;

	const lastWeek = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
	const lastMonth = new Date(new Date().getTime() - 7 * 4 * 24 * 60 * 60 * 1000);
	const lastYear = new Date(new Date().getTime() - 365 * 24 * 60 * 60 * 1000);
	$: timerange = lastYear;

	$: category = 0;

	let gx: SVGGElement;
	let gy: SVGGElement;

	$: x = d3.scaleUtc([timerange, new Date()], [padding, width - padding]);
	$: y = d3.scaleLinear(d3.extent(entries.map((d) => d.images_published)) as Iterable<Number>, [height - padding, padding]);

	$: d3.select(gx).call(d3.axisBottom(x));
	$: d3.select(gy).call(d3.axisLeft(y));
</script>

<svelte:window bind:innerHeight bind:innerWidth />
<nav>
	<ul>
		<li>
			<img
				src={Logo}
				alt="The Michigan Daily logo"
				width="35px"
				height="35px"
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
		<select bind:value={timerange}>
			<option value={lastWeek}>Last week</option>
			<option value={lastMonth}>Last month</option>
			<option value={lastYear} selected>Last year</option>
		</select>
		<select bind:value={category}>
			<option>All</option>
			<option>News</option>
			<option>Sports</option>
			<option>Opinion</option>
		</select>
	</div>

	<figure>
		<svg {width} {height}>
			<g bind:this={gx} transform="translate({0}, {height - padding})" />
			<g bind:this={gy} transform="translate({padding}, {0})" />
			{#each index as [date, values], i}
			<g transform="translate({padding + i * 10}, {height - values["Images published with alternative text"] - padding})">
				<rect fill="lightgreen" width={10} height={values["Images published with alternative text"]}/>
			</g>
			{/each}
		</svg>
	</figure>
</main>

<style>
	h1 {
		font-size: 1.1rem;
	}
	h2 {
		font-size: 1.25rem;
	}

	figure {
		margin: 0;
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
