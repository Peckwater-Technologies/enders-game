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
					x={-0.5 * shooter.gunWidth}
					y={-Math.sqrt(2) * shooter.radius - shooter.gunLength}
					width={shooter.gunWidth}
					height={shooter.gunLength}
					fill='black'
				/>
				<Ellipse
					id='right-hand'
					width={shooter.handRadius * 2}
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