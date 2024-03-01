import type { LayoutServerLoad } from './$types';
import type { DateEntry } from '$lib/types';

export const load: LayoutServerLoad = async ({ platform }) => {
	const response = await platform?.env.DB.prepare(
		'SELECT * FROM date_entries WHERE date > "2022-12-31" ORDER BY date ASC'
	).all();

	return {
		entries: response?.results as Array<DateEntry>|[],
	};
};