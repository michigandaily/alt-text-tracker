<script lang="ts">
	import type { GraphData } from '$lib/types';
	import * as d3 from 'd3';
	export let width: number;
	export let height: number;
	export let index: d3.InternMap<string, GraphData>;
	export let category: number | null;

	const padding = 32;
	$: [earliest, latest] = d3.extent([...index].map(([d]) => new Date(d))) as Iterable<Date>;
	$: numBars = Math.floor(
		(latest.getTime() + 1000 * 3600 * 24 - earliest.getTime()) / (1000 * 3600 * 24)
	);

	$: x = d3.scaleUtc(
		[earliest, new Date(latest.getTime() + 1000 * 3600 * 24)] as Iterable<Number>,
		[padding, width]
	);
	$: y = d3.scaleLinear(
		[0, d3.max([...index].map(([d, v]) => v.images_published))] as Iterable<Number>,
		[height - padding, padding]
	);

	let gx: SVGGElement;
	let gy: SVGGElement;
	$: d3.select(gx).call(d3.axisBottom(x));
	$: d3.select(gy).call(d3.axisLeft(y));

	function handleMouseOver(d: MouseEvent, data: { date: string; values: GraphData }) {
		d3.select('.tooltip')
			.style('display', 'block')
			.style('left', d.pageX + 'px')
			.style('top', d.pageY + 'px')
			.text(
				`On ${data.date}, ${data.values.images_published_with_alt_text} out of ${data.values.images_published} images 
                had alt text (${((data.values.images_published_with_alt_text / data.values.images_published) * 100).toFixed(2)}%)`
			);

		d3.selectAll('.stacked-bar').style('opacity', '0.25');
		(d.target as SVGRectElement).style.opacity = '1';
	}

	function handleMouseOut() {
		d3.select('.tooltip').style('display', 'none');
		d3.selectAll('.stacked-bar').style('opacity', 1);
	}
</script>

<figure>
	<div class="tooltip"></div>
	<svg {width} {height} role="img" aria-labelledby="chart-title chart-desc">
		<title id="chart-title"></title>
		<!-- TODO: more descriptive -->
		<desc id="chart-desc">
			Amount of images published with alternative text every day over a period of time
		</desc>
		<g bind:this={gx} transform="translate({0}, {height - padding})" />
		<g bind:this={gy} transform="translate({padding}, {0})" />
		<g>
			{#each index as [date, values]}
				<a
					href={`posts?${category ? `category=${category}` : ''}				
				${date ? `&start=${date}` : ''}
				${date ? `&end=${date}` : ''}`}
				>
					<g
						class="stacked-bar"
						role="none"
						style="margin: 0; padding; 0; gap: 0;"
						on:mouseenter={(d) => handleMouseOver(d, { date, values })}
						on:mouseleave={handleMouseOut}
					>
						<rect
							fill="lightcoral"
							x={x(new Date(date))}
							width={Math.max((width - padding) / numBars, 1)}
							y={y(values.images_published)}
							height={height - padding - y(values.images_published)}
						/>
						<rect
							fill="lightgreen"
							x={x(new Date(date))}
							width={Math.max((width - padding) / numBars, 1)}
							y={y(values.images_published_with_alt_text)}
							height={Math.max(height - padding - y(values.images_published_with_alt_text), 0)}
						/>
					</g>
				</a>
			{/each}
		</g>
	</svg>
</figure>

<style>
	figure {
		margin: 0;
		border: 1px solid var(--text-color-theme);
		border-radius: 1rem;
		background: var(--secondary-color-theme);
	}

	.tooltip {
		position: absolute;
		display: none;
		padding: 5px;
		background-color: white;
		color: black;
		border: 1px solid black;
		pointer-events: none;
	}
</style>
