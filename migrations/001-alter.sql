CREATE TABLE IF NOT EXISTS articles (
    aid                                 INTEGER PRIMARY KEY,
    date                                TEXT NOT NULL,
    images_published                    INTEGER NOT NULL,
    images_published_with_alt_text      INTEGER NOT NULL,
    categories                          TEXT NOT NULL
);