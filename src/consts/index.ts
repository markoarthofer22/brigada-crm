const TODAY = new Date().toISOString()
const TODAY_MINUS_30_DAYS = new Date(
	new Date().getFullYear(),
	new Date().getMonth(),
	new Date().getDate() - 30
).toISOString()

export {
	TODAY,
	TODAY_MINUS_30_DAYS,
	// Add other constants here as needed
}
