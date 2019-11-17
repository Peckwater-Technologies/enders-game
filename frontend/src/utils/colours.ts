export function parseRGB(hex: string): Array<number> {
	if (hex.startsWith('#')) hex = hex.slice(1);
	if (hex.length !== 6) return [0, 0, 0];
	let r = hex.slice(0, 2);
	let g = hex.slice(2, 4);
	let b = hex.slice(4, 6);
	return [r, g, b].map(v => parseInt(v, 16));
}

export function parseHex(rgb: Array<number>): string {
	let hex = '#' + rgb.map((number: number) => {
		let letter = number.toString(16);
		return '0'.repeat(2 - letter.length) + letter;
	}).join('');
	return hex;
}