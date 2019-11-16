import React from 'react';
import {Circle, Group} from 'react-konva';
import config from '../config.json';
const {shooter} = config;

export default class Bullet extends React.Component {

	render() {
		let b = this.props.data;
		return (			
			<Group
				rotation={b.angle}
				x={b.x}
				y={b.y}
			>
				<Circle
					width={shooter.width}
					height={shooter.height}
					fill={shooter.colour}
					rotation={b.angle}
					draggable={true}
				/>
				<Circle
					x={shooter.width / (2 * Math.sqrt(2))}
					y={-shooter.height / (2 * Math.sqrt(2))}
					width={10}
					height={10}
					fill='white'
					rotation={b.angle}
					draggable={true}
				/>
				<Circle
					x={-shooter.width / (2 * Math.sqrt(2))}
					y={-shooter.height / (2 * Math.sqrt(2))}
					width={10}
					height={10}
					fill='white'
					rotation={b.angle}
					draggable={true}
				/>
			</Group>
		)
	}
}