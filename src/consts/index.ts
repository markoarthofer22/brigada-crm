const TODAY = new Date().toISOString()
const TODAY_MINUS_30_DAYS = new Date(
	new Date().getFullYear(),
	new Date().getMonth(),
	new Date().getDate() - 30
).toISOString()

const CHART_COLORS = [
	'#A02214',
	'#BC5D28',
	'#FEC87C',
	'#6E2405',
	'#6C7039',
	'#C3B49B',
	'#0A3542',
	'#507282',
	'#875A64',
	'#C49A6C',
]

export {
	TODAY,
	TODAY_MINUS_30_DAYS,
	CHART_COLORS,
	// Add other constants here as needed
}
