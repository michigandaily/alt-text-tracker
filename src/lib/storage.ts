export const D1CacheName = "d1-michigan-daily-alt-text-tracker";

export const cachePut = async (url: URL, cache: Cache, response: D1Result<Record<string, unknown>>) => {
    const entry = new Response(JSON.stringify(response.results));
	entry.headers.append('Cache-Control', 's-maxage=86400');

    await cache.put(url, entry);
    console.log("Populated cache")
}

export const cacheGet = async (url: URL, cache: Cache) => {
    const response = await cache.match(url);
    const entry = await response?.json();
    console.log("Retrieving from cache")

    return entry;
}