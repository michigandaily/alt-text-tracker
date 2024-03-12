<script lang="ts">
	import type { GraphData } from '$lib/types';
	import * as d3 from 'd3';
	export let width: number;
	export let height: number;
	export let index: d3.InternMap<string, GraphData>;

	const padding = 32;
	$: [earliest, latest] = d3.extent([...index].map(([d]) => new Date(d))) as Iterable<Date>;

	$: x = d3.scaleUtc(
		[earliest, new Date(latest.getTime() + 1000 * 3600 * 24)] as Iterable<Number>,
		[padding, width]
	);
	$: y = d3.scaleLinear([0, 100], [height - padding, padding]);

	$: averages = [...index].map(([d], i) => [
		d,
		(d3.sum([...index].slice(0, i + 1).map(([d, v]) => v.images_published_with_alt_text)) /
		d3.sum([...index].slice(0, i + 1).map(([d, v]) => v.images_published))) * 100
	]);

	let gx: SVGGElement;
	let gy: SVGGElement;
	$: d3.select(gx).call(d3.axisBottom(x));
	$: d3.select(gy).call(d3.axisLeft(y));

	$: line = d3
		.line()
		.x(([d]) => x(new Date(d)))
		.y(([d, v]) => y(v));

	function handleMouseOver(d: MouseEvent, data: { date: string; value: number }) {
		d3.select('.tooltip')
			.style('display', 'block')
			.style('left', d.pageX + 'px')
			.style('top', d.pageY + 'px')
			.text(
				`On ${data.date}, the running average percent of images published with alt text is ${data.value.toFixed(2)}%`
			);
	}

	function handleMouseOut() {
		d3.select('.tooltip').style('display', 'none');
	}
</script>

<figure>
	<div id="tooltip"></div>
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
			<circle
				role="none"
				on:mouseenter={(d) => handleMouseOver(d, { date, value: average })}
				on:mouseleave={handleMouseOut}
				cx={x(new Date(date))}
				cy={y(average)}
				r="5"
                stroke-width="1"
                stroke="steelblue"
				fill="transparent"
			/>
            
		{/each}
	</svg>
</figure>

<style>
	figure {
		margin: 0;
		margin-top: 1rem;
		border: 1px solid var(--text-color-theme);
		border-radius: 1rem;
		background: var(--secondary-color-theme);
	}
</style>
