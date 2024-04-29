import type { Block, ImageData, Author } from '@michigandaily/wputils';

function addImageWithoutAltText(image: ImageData, imageList: Array<ImageData>) {
	if (image && (!image.alt || (image.alt && image.alt.length === 0))) {
		imageList.push(image);
	}
}

export function parseContent(image: ImageData | null, content: Array<Block> | null) {
	const images: Array<ImageData> = [];
	parseArticle(image, content, (i: ImageData) => addImageWithoutAltText(i, images));
	return images;
}

function parseBlock(block: Block, handleImage: (i: ImageData) => void) {
	if (block.blockName === 'core/image' && block.data) {
		handleImage(block.data);
	} else if (block.blockName === 'core/gallery') {
		block.innerBlocks.forEach((block) => {
			if (block.blockName === 'core/image' && block.data) {
				handleImage(block.data);
			}
		});
	} else if (
		(block.blockName === 'jetpack/tiled-gallery' || block.blockName == 'jetpack/slideshow') &&
		block.data
	) {
		block.data.forEach((image: ImageData) => {
			handleImage(image);
		});
	} else if (block.blockName === 'jetpack/image-compare' && block.data) {
		block.data.forEach((image: ImageData) => {
			handleImage(image);
		});
	} else if (
		block.blockName === 'core/columns' ||
		block.blockName === 'core/column' ||
		block.blockName === 'core/group'
	) {
		block.innerBlocks.forEach((block: Block) => parseBlock(block, handleImage));
	}
}

export function parseArticle(
	image: ImageData | null,
	content: Array<Block> | null,
	handleImage: (i: ImageData) => void
) {
	if (image) {
		handleImage(image);
	}

	if (content) {
		content.forEach((block: Block) => {
			parseBlock(block, handleImage);
		});
	}
}

export function parseSources(image: ImageData) {
	if (!image) return null;
	return image.sources
		.map(
			(source: { uri: string; width: number; height: number }) => `${source.uri} ${source.width}w `
		)
		.join(',');
}

export function parseAuthors(authors: Author[]) {
	if (authors.length === 0) {
		return '';
	}

	if (authors.length === 1) {
		return authors.at(0)!.display_name;
	}

	return `${authors
		.slice(0, -1)
		.map((author) => author.display_name)
		.join(', ')} and ${authors.at(-1)!.display_name}`;
}
