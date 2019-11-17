let i = 1;

export function randBetween(min: number, max: number, rand: number | undefined): number {
	let multiplier;
	if (rand) multiplier = Number('0.' + rand.toString().slice(2, 2 + 10 * i));
	else multiplier = Math.random();
	return Math.floor(multiplier * (max - min + 1) + min);
}