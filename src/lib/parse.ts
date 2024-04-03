import type { Block, Image } from './types';

function addImageWithoutAltText(image: Image, imageList: Array<Image>) {
	if (image && (!image.alt || (image.alt && image.alt.length === 0))) {
		imageList.push(image);
	}
}

function parseBlock(block: Block, images: Array<Image>) {
	if (block.blockName == 'core/image' && !Array.isArray(block.data)) {
		addImageWithoutAltText(block.data, images);
	} else if (block.blockName == 'core/gallery') {
		block.innerBlocks.forEach((block) => {
			if (block.blockName === 'core/image' && !Array.isArray(block.data)) {
				addImageWithoutAltText(block.data, images);
			}
		});
	} else if (
		(block.blockName == 'jetpack/tiled-gallery' || block.blockName == 'jetpack/slideshow') &&
		Array.isArray(block.data)
	) {
		block.data.forEach((image: Image) => {
			addImageWithoutAltText(image, images);
		});
	} else if (block.blockName == 'jetpack/image-compare' && Array.isArray(block.data)) {
		block.data.forEach((image: Image) => {
			addImageWithoutAltText(image, images);
		});
	} else if (block.blockName == 'core/columns' || block.blockName == 'core/column' || block.blockName == 'core/group') {
		block.innerBlocks.forEach((block) => parseBlock(block, images));
	}
}

// Worker uses a similar way of parsing image content. Is there a way
// to prevent code duplication?
export function parseContent(image: Image, content: Array<Block>) {
	const images: Array<Image> = [];

	addImageWithoutAltText(image, images);
	content.forEach((block: Block) => {
		parseBlock(block, images);
	});

	return images;
}

export function parseSources(image: Image) {
	if (!image) return null;
	return image.sources
		.map(
			(source: { uri: string; width: number; height: number }) =>
				`${source.uri} ${source.width}w `
		)
		.join(",");
}
