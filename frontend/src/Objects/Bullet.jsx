import React from 'react';
import {Rect} from 'react-konva';
import config from '../config.json';
const {bullet} = config;

export default class Bullet extends React.Component {

	render() {
		let b = this.props.data;
		return (
			<Rect
				x={b.x}
				y={b.y}
				width={bullet.width}
				height={bullet.height}
				fill={bullet.colour}
				rotation={b.angle}
			/>
		)
	}
}