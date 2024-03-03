<script lang="ts">
	import { parseSources } from "$lib/parse";
    import type { Image } from "$lib/types";

    export let images:Array<Image>;
    let index = 0;
    $: image = images[index];
</script>
<div style="display: flex; flex-flow: column nowrap; align-items: center; gap: 10px;">
    <img srcset={parseSources(image)} alt="Needs alt text"/>
    <div>
        <button on:click={() => index--} disabled={index === 0}>←</button>
        <button on:click={() => index++} disabled={index === images.length - 1} >→</button>
    </div>  
    {index+1}/{images.length}
    {#if images.length > 0}
        <p style="color: lightcoral; margin: 0;">{images.length} image{images.length > 1 ? "s" : ""} without alt text</p>
    {:else}
        <p style="color: lightgreen; margin: 0;">All images have alt text</p>
    {/if}

</div>

<style>
    img {
        width: min(700px, 100%);
        max-height: 275px;
        object-fit: contain;
    }
    button {
        aspect-ratio: 1;
        font-size: 1.5rem;
        border: 1px solid var(--text-color-theme);

        color: var(--text-color-theme);
        background: var(--primary-color-theme);
    }
</style>


