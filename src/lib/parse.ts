import type { Block, Image } from './types';

function addImageWithoutAltText(image: Image, imageList: Array<Image>) {
	if (image && (!image.alt || (image.alt && image.alt.length === 0))) {
		imageList.push(image);
	}
}

export function parseContent(image: Image, content: Array<Block>) {
	const images: Array<Image> = [];
	parseArticle(image, content, (i: Image) => addImageWithoutAltText(i, images));
	return images;
}

function parseBlock(block: Block, handleImage: (i: Image) => void) {
	if (block.blockName == 'core/image' && !Array.isArray(block.data)) {
		handleImage(block.data);
	} else if (block.blockName == 'core/gallery') {
		block.innerBlocks.forEach((block) => {
			if (block.blockName === 'core/image' && !Array.isArray(block.data)) {
				handleImage(block.data);
			}
		});
	} else if (
		(block.blockName == 'jetpack/tiled-gallery' || block.blockName == 'jetpack/slideshow') &&
		Array.isArray(block.data)
	) {
		block.data.forEach((image: Image) => {
			handleImage(image);
		});
	} else if (block.blockName == 'jetpack/image-compare' && Array.isArray(block.data)) {
		block.data.forEach((image: Image) => {
			handleImage(image);
		});
	} else if (
		block.blockName == 'core/columns' ||
		block.blockName == 'core/column' ||
		block.blockName == 'core/group'
	) {
		block.innerBlocks.forEach((block) => parseBlock(block, handleImage));
	}
}

export function parseArticle(image: Image, content: Array<Block>, handleImage: (i: Image) => void) {
	handleImage(image);

	content.forEach((block: Block) => {
		parseBlock(block, handleImage);
	});
}

export function parseSources(image: Image) {
	if (!image) return null;
	return image.sources
		.map(
			(source: { uri: string; width: number; height: number }) => `${source.uri} ${source.width}w `
		)
		.join(',');
}

export function parseAuthors(authors:Array<{display_name: string }>) {
	if (authors.length === 0) {
		return "";
	}

	if (authors.length === 1) {
	  return authors.at(0)!.display_name;
	}
  
	return `${authors
	  .slice(0, -1)
	  .map((author) => author.display_name)
	  .join(", ")} and ${authors.at(-1)!.display_name}`;
  }
