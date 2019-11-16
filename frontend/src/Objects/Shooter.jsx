import React from 'react';
import {Circle} from 'react-konva';
import config from '../config.json';
const {shooter} = config;

export default class Bullet extends React.Component {

	render() {
		let b = this.props.data;
		return (
			<Circle
				x={b.x}
				y={b.y}
				width={shooter.width}
				height={shooter.height}
				fill={shooter.colour}
				rotation={b.angle}
				draggable={true}
			/>
		)
	}
}