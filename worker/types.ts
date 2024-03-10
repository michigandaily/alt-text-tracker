export interface PostsQuery {
	posts: Array<Article>;
	total_pages: number;
}

export interface Article {
	id: number;
	title: string;
	permalink: string;
	date: string;
	image: Image;
	content: Array<Block>;
	categories: Array<number>;
}

export interface Block {
	blockName: string;
	data: Array<Image> | Image;
	innerContent: Array<string>;
	innerBlocks: Array<Block>;
}

export interface Image {
	sources: Array<{
		uri: string;
		width: number;
		height: number;
	}>;
	alt: string;
}

export interface DateEntry {
	images_published: number;
	images_published_with_alt_text: number;
	category_data: Record<
		number,
		{
			images_published: number;
			images_published_with_alt_text: number;
		}
	>;
	article_ids: Array<number>;
	articles_published: number;
}
