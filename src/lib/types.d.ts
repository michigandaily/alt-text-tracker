export interface DateEntry {
    date: string,
    images_published: number,
    images_published_with_alt_text: number,
    category_data: string,
    article_ids: Array<number>,
    articles_published: number,
}

export interface Article {
    id: number,
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