import React from 'react';
import {Ellipse, Circle, Rect, Group} from 'react-konva';
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
					radius={shooter.radius}
					fill={shooter.colour}
					rotation={b.angle}
					draggable={true}
				/>	
				<Circle
					id='left-hand'
					//x={-shooter.radius / (Math.sqrt(2))}
					//y={-shooter.radius / (Math.sqrt(2))}
					y={-shooter.radius}
					radius={5}
					fill='white'
					rotation={b.angle}
					draggable={true}
				/>		
				<Rect
					id='gun'
					x={-4}
					y={-Math.sqrt(2 * (shooter.radius ** 2)) - 30}
					width={8}
					height={30}
					fill='black'
					draggable={true}
				/>
				<Ellipse
					id='right-hand'
					width={10}
					height={10}
					x={Math.sqrt((shooter.radius ** 2) / 8)}
					y={-2 * shooter.radius}
					//height={shooter.radius}
					//x={Math.sqrt((shooter.radius ** 2) / 8)}
					//y={-3 * Math.sqrt((shooter.radius ** 2) / 8)}
					fill='white'
					rotation={-45}
					draggable={true}
				/>
			</Group>
		)
	}
}