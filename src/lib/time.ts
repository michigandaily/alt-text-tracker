export const lastWeek = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
export const lastMonth = new Date(new Date().getTime() - 31 * 24 * 60 * 60 * 1000);
export const lastSixMonths = new Date(new Date().getTime() - 31 * 24 * 60 * 60 * 1000 * 6);
export const lastYear = new Date(new Date().getTime() - 365 * 24 * 60 * 60 * 1000);
export const all = new Date('2022-12-31');

export function formatISODate(
	date: string,
	{ weekday, year, month, day }: Intl.DateTimeFormatOptions
) {
	return new Date(date).toLocaleDateString('en-us', {
		timeZone: 'UTC',
		weekday,
		year,
		month,
		day
	});
}
