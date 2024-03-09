<script lang="ts">
	import * as d3 from 'd3';
	import type { DateEntry } from '$lib/types';

	export let data;
	let entries = data?.entries;

	$: timerange = all;

	const lastWeek = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
	const lastMonth = new Date(new Date().getTime() - 7 * 4 * 24 * 60 * 60 * 1000);
	const lastSixMonths = new Date(new Date().getTime() - 7 * 4 * 24 * 60 * 60 * 1000 * 6);
	const lastYear = new Date(new Date().getTime() - 365 * 24 * 60 * 60 * 1000);
	const all = new Date('2022-12-31');

	$: category = null;

	const gap = 0;
	const padding = 32;
	$: innerWidth = 1300;
	$: innerHeight = 600;
	$: width = innerWidth / 1.05;
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
				value: category
					? JSON.parse(d.category_data)[category]?.images_published_with_alt_text ?? 0
					: d.images_published_with_alt_text
			},
			{
				date: d.date,
				status: 'Images published',
				value: category
					? JSON.parse(d.category_data)[category]?.images_published ?? 0
					: d.images_published
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

	function handleMouseOver(
		d: MouseEvent | FocusEvent,
		data: { date: string; values: Record<string, number> }
	) {
		d3.select('.tooltip')
			.style('opacity', 1)
			.style('left', d.pageX + 'px')
			.style('top', d.pageY - 200 + 'px')
			.text(
				`On ${data.date}, ${data.values['Images published with alternative text']} out of ${data.values['Images published']} images had alt text (${((data.values['Images published with alternative text'] / data.values['Images published']) * 100).toFixed(2)}%)`
			);

		d3.selectAll('.stacked-bar').style('opacity', '0.25');
		d.target!.parentElement.style.opacity = 1;
	}

	function handleMouseOut() {
		d3.select('.tooltip').transition().duration(50).style('opacity', 0);
		d3.selectAll('.stacked-bar').style('opacity', 1);
	}
</script>

<svelte:window bind:innerHeight bind:innerWidth />

<main>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<section on:mouseover={handleMouseOut} on:focus={handleMouseOut}>
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
	<figure>
		<div class="tooltip"></div>
		<svg {width} {height}>
			<g bind:this={gx} transform="translate({0}, {height - padding})" />
			<g bind:this={gy} transform="translate({padding}, {0})" />
			<g>
				{#each index as [date, values]}
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<g
						class="stacked-bar"
						style="margin: 0; padding; 0; gap: 0;"
						on:mouseover={(d) => handleMouseOver(d, { date, values })}
						on:focus={(d) => handleMouseOver(d, { date, values })}
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
		display: block;
		opacity: 0;
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
