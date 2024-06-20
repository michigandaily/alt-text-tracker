import { D1CacheName, cacheInvalidate } from '$lib/storage';
import { error, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ platform, request }) => {
	if (platform === undefined) {
		error(400, { message: 'Platform is undefined' });
	}

	if (platform.env.CACHEKEY !== request.headers.get(`${D1CacheName}-key`)) {
		return error(401, { message: 'Action not authorized' });
	}

	const cache = await platform.caches.open(D1CacheName);
	const response = await cacheInvalidate([], cache);

	return new Response(JSON.stringify(response));
};
