import type { Block, Image } from './types';

function addImageWithoutAltText(image: Image, imageList: Array<Image>) {
	if (image && (!image.alt || (image.alt && image.alt.length === 0))) {
		imageList.push(image);
	}
}

// Worker uses a similar way of parsing image content. Is there a way
// to prevent code duplication?
export function parseContent(image: Image, content: Array<Block>) {
	const images: Array<Image> = [];

	addImageWithoutAltText(image, images);
	content.forEach((block: Block) => {
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
		}
	});

	return images;
}

export function parseSources(image: Image) {
	if (!image) return null;
	return image.sources
		.map(
			(source: { uri: string; width: number; height: number }) =>
				`${source.uri} ${source.width}w , `
		)
		.toString();
}
