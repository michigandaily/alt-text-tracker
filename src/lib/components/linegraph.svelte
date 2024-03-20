<script lang="ts">
	import type { GraphData } from '$lib/types';
	import * as d3 from 'd3';
	export let width: number;
	export let height: number;
	export let index: d3.InternMap<string, GraphData>;

	const padding = 32;
	$: [earliest, latest] = d3.extent([...index].map(([d]) => new Date(d))) as Iterable<Date>;
	$: numBars = Math.floor(
		(latest.getTime() + 1000 * 3600 * 24 - earliest.getTime()) / (1000 * 3600 * 24)
	);

	$: x = d3.scaleUtc(
		[earliest, new Date(latest.getTime() + 1000 * 3600 * 24)] as Iterable<Number>,
		[padding, width]
	);
	$: y = d3.scaleLinear([0, 100], [height - padding, padding]);

	$: averages = [...index].map(([d], i) => [
		d,
		(d3.sum([...index].slice(0, i + 1), ([d, v]) => v.images_published_with_alt_text) /
			d3.sum([...index].slice(0, i + 1), ([d, v]) => v.images_published)) *
			100
	]) as [string, number][];

	let gx: SVGGElement;
	let gy: SVGGElement;
	$: d3.select(gx).call(d3.axisBottom(x));
	$: d3.select(gy).call(d3.axisLeft(y));

	$: line = d3
		.line()
		.x(([d]) => x(new Date(d)))
		.y(([d, v]) => y(v));

	function handleMouseOver(d: MouseEvent, data: { date: string; value: number }) {
		if (
			Math.abs(new Date(data.date).getTime() - earliest.getTime()) >
			Math.abs(new Date(data.date).getTime() - latest.getTime())
		) {
			d3.select('#label')
				.attr('x', x(new Date(data.date)) - 400)
				.attr('y', y(data.value))
				.text(`On ${data.date}, the averge % of images with alt text is ${data.value.toFixed(2)}%`);
		} else {
			d3.select('#label')
				.attr('x', x(new Date(data.date)))
				.attr('y', y(data.value))
				.text(`On ${data.date}, the averge % of images with alt text is ${data.value.toFixed(2)}%`);
		}
	}

	function handleMouseOut() {
		d3.select('#label').text('');
	}
</script>

<figure>
	<svg {width} {height} aria-labelledby="chart-title chart-desc">
		<title id="chart-title"></title>
		<desc id="chart-desc">
			Line chart representing a running average percentage of images published with alt text over a
			period of time
		</desc>
		<g bind:this={gx} transform="translate({0}, {height - padding})" />
		<g bind:this={gy} transform="translate({padding}, {0})" />
		<path fill="none" stroke="steelblue" stroke-width="1.5" d={line(averages)} />
		{#each averages as [date, average]}
			<rect
				role="none"
				on:mouseenter={(d) => handleMouseOver(d, { date, value: average })}
				on:mouseleave={handleMouseOut}
				x={x(new Date(date))}
				{height}
				width={(width - padding) / numBars}
				fill="transparent"
			/>
		{/each}
		<text id="label"></text>
	</svg>
</figure>

<style>
	figure {
		margin: 0;
		border: 1px solid var(--text-color-theme);
		border-radius: 1rem;
		background: var(--secondary-color-theme);
	}

	text {
		fill: white;
		font-size: 14px;
		width: 2rem;
		pointer-events: none;
	}
</style>
