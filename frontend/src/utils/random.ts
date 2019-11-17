export function randBetween(min: number, max: number): number {
	let multiplier = Math.random();
	return Math.floor(multiplier * (max - min + 1) + min);
}