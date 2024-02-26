CREATE TABLE IF NOT EXISTS date_entries (
    e_id                                INTEGER PRIMARY KEY AUTOINCREMENT,
    date                                TEXT UNIQUE NOT NULL, 
    articles_published                  INTEGER NOT NULL,
    images_published                    INTEGER NOT NULL,
    images_published_with_alt_text      INTEGER NOT NULL,
    category_data                       TEXT NOT NULL,
    article_ids                         TEXT NOT NULL          
);