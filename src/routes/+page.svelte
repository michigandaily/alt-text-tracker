<script lang="ts">
	import * as d3 from 'd3';
	import type { DateEntry } from '$lib/types';

	export let data: { entries: Array<DateEntry> } | null;
	let entries = data?.entries ?? [];

	$: timerange = all;

	const lastWeek = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
	const lastMonth = new Date(new Date().getTime() - 7 * 4 * 24 * 60 * 60 * 1000);
	const lastYear = new Date(new Date().getTime() - 365 * 24 * 60 * 60 * 1000);
	const all = new Date('2022-12-31');

	$: category = 0;

	const gap = 1;
	const padding = 32;
	$: innerWidth = 1300;
	$: innerHeight = 600;
	$: width = innerWidth / 1.1;
	$: height = innerHeight / 1.75;

	let tidy = entries
		.map((d: DateEntry) => [
			{
				date: d.date,
				status: 'Images published with alternative text',
				value: d.images_published_with_alt_text
			},
			{
				date: d.date,
				status: 'Images published',
				value: d.images_published
			}
		])
		.flat();

	$: tidy = entries
		.map((d: DateEntry) => [
			{
				date: d.date,
				status: 'Images published with alternative text',
				value: d.images_published_with_alt_text
			},
			{
				date: d.date,
				status: 'Images published',
				value: d.images_published
			}
		])
		.flat()
		.filter((entry) => entry.date > timerange.toISOString().split('T')[0]);

	$: index = d3.rollup(
		tidy,
		(v) => Object.fromEntries(v.map((o) => [o.status, o.value])),
		(d) => d.date
	);

	$: x = d3.scaleUtc(d3.extent(tidy.map((d) => new Date(d.date))) as Iterable<Number>, [
		padding,
		width - padding
	]);
	$: y = d3.scaleLinear(d3.extent(tidy.map((d) => d.value)) as Iterable<Number>, [
		height - padding,
		padding
	]);

	let gx: SVGGElement;
	let gy: SVGGElement;
	$: d3.select(gx).call(d3.axisBottom(x));
	$: d3.select(gy).call(d3.axisLeft(y));

	// Function to handle mouseover event
	function handleMouseOver(d, data) {
		// Get mouse coordinates
		let [xPos, yPos] = d3.pointer(d);

		// Show the tooltip box
		d3.select('.tooltip')
			.style('display', 'block')
			.style('left', xPos + 'px')
			.style('top', yPos + 'px')
			.text(
				`${data.date}, ${data.values['Images published with alternative text']} out of ${data.values['Images published']}`
			);
	}

	// Function to handle mouseout event
	function handleMouseOut() {
		// Hide the tooltip box
		d3.select('.tooltip').style('display', 'none');
	}
</script>

<svelte:window bind:innerHeight bind:innerWidth />

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
			<option value={all}></option>
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
		<div class="tooltip"></div>
		<svg {width} {height}>
			<g bind:this={gx} transform="translate({0}, {height - padding})" />
			<g bind:this={gy} transform="translate({padding}, {0})" />
			<g>
				{#each index as [date, values]}
					<g
						style="margin: 0; padding; 0; gap: 0;"
						on:mouseover={(d) => handleMouseOver(d, { date, values })}
						on:mouseout={() => handleMouseOut}
						on:focus={() => {}}
						on:blur={() => {}}
						role="contentinfo"
					>
						<rect
							fill="lightcoral"
							x={x(new Date(date))}
							width={(width - padding) / (tidy.length / 2) - gap}
							y={y(values['Images published'])}
							height={height - padding - y(values['Images published'])}
						/>
						<rect
							fill="lightgreen"
							x={x(new Date(date))}
							width={(width - padding) / (tidy.length / 2) - gap}
							y={y(values['Images published with alternative text'])}
							height={height - padding - y(values['Images published with alternative text'])}
						/>
					</g>
				{/each}
			</g>
		</svg>
	</figure>
</main>

<style>
	h2 {
		font-size: 1.25rem;
	}

	figure {
		margin: 0;
	}
	.tooltip {
		position: absolute;
		display: none;
		padding: 5px;
		background-color: white;
		color: black;
		border: 1px solid black;
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
