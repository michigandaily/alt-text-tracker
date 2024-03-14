import type { InternSet } from "d3";

export interface ArticleEntry {
	date: string;
	images_published: number;
	images_published_with_alt_text: number;
	categories: string;
}

export interface GraphData {
	articles_published: number;
	articles_published_with_alt_text: number;
	images_published: number;
	images_published_with_alt_text: number;
	categories: InternSet<string>;
}

export interface Article {
	id: number;
	title: string;
	permalink: string;
	date: string;
	image: Image;
	content: Array<Block>;
}

export interface Image {
	sources: Array<{
		uri: string;
		width: number;
		height: number;
	}>;
	alt: string;
}

export interface Block {
	blockName: string;
	data: Array<Image> | Image;
	innerContent: Array<string>;
	innerBlocks: Array<Block>;
}
