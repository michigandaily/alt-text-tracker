import type { InternSet } from "d3";
import type { Article } from '@michigandaily/wputils';

export type ArticleQuery = Article & { categories: number[]}

export interface PostsQuery {
	posts: Array<ArticleQuery>;
	total_pages: number;
}

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

export interface CacheResponse {
	entries: ArticleEntry[];
	after?: string;
	before?: string;
}
