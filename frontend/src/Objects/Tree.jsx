import React from 'react';
import {Circle, Group} from 'react-konva';

import {randBetween} from '../utils/random';
import {parseHex, parseRGB} from '../utils/colours'

import {GameOptions} from '../shared/shooter_interfaces.ts';
import config from '../config.json';
const {tree} = config;

export default class Tree extends React.Component {

	render() {
		let b = this.props;
		console.log(b);
		let trees = [];
		for (let i = 0; i < 4; i++) {
			let base_x = i & 1;
			let base_y = i & 2;
			trees.push(
				<Circle
					key={['tree', b.x, b.y, i].join('.')}
					x={((base_x ? 1 : -1) * GameOptions.treeRadius) + randBetween(-20, 20, this.props.rand)}
					y={((base_y ? 1 : -1) * GameOptions.treeRadius) + randBetween(-20, 20, this.props.rand)}
					radius={randBetween(GameOptions.treeRadius * 2, GameOptions.treeRadius * 3, this.props.rand)}
					fill={parseHex(parseRGB(tree.colour).map(value => value += randBetween(-30, 30, this.props.rand)))}
					opacity={0.6}
				/>
			)
		}
		return (
			<Group
				rotation={randBetween(0, 360, this.props.rand)}
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