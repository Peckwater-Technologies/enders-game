import React from 'react';
import {Rect, Group} from 'react-konva';
import config from '../config.json';
const {bullet} = config;

export default class Bullet extends React.Component {

	render() {
		let b = this.props.data;
		return (
			<Group
				rotation={b.angle}
				x={b.x}
				y={b.y}
			>
				<Rect
					width={bullet.width}
					height={bullet.height}
					fill={bullet.colour}
				/>
			</Group>
		)
	}
}