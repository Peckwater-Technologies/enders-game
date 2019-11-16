import React from 'react';
import {Circle, Group} from 'react-konva';

import {GameOptions} from '../shared/shooter_interfaces.ts';
import config from '../config.json';
const {tree} = config;

export default class Tree extends React.Component {

	render() {
		let b = this.props.data;
		let trees = [];
		for (let i = 0; i < 4; i++) {
			let base_x = i & 1;
			let base_y = i & 2;
			trees.push(
				<Circle
					key={['tree', b.x, b.y, i].join('.')}
					x={((base_x ? 1 : -1) * GameOptions.treeRadius) + randBetween(-20, 20)}
					y={((base_y ? 1 : -1) * GameOptions.treeRadius) + randBetween(-20, 20)}
					radius={randBetween(GameOptions.treeRadius * 2, GameOptions.treeRadius * 3)}
					fill={parseHex(parseRGB(tree.colour).map(value => value += randBetween(-30, 30)))}
					opacity={0.6}
				/>
			)
		}
		return (
			<Group
				rotation={randBetween(0, 360)}
				x={b.x}
				y={b.y}
			>
				{trees}
				<Circle
					radius={GameOptions.treeRadius + 5}
					fill='black'
					opacity={0.6}
				/>
				<Circle
					key={['tree', b.x, b.y, 'trunk'].join('.')}
					id={['tree', b.x, b.y, 'trunk'].join('.')}
					radius={GameOptions.treeRadius}
					fill={tree.trunkColour}
					opacity={0.8}
				/>			
			</Group>
		)
	}
}

function parseRGB(hex) {
	if (hex.startsWith('#')) hex = hex.slice(1);
	if (hex.length !== 6) return 0;
	let r = hex.slice(0, 2);
	let g = hex.slice(2, 4);
	let b = hex.slice(4, 6);
	return [r, g, b].map(v => parseInt(v, 16));
}

function parseHex(rgb) {
	let hex = '#' + rgb.map((number) => {
		let letter = number.toString(16);
		return '0'.repeat(2 - letter.length) + letter;
	}).join('');
	return hex;
}

function randBetween(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}