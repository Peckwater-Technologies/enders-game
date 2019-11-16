import React from 'react';
import {Ellipse, Circle, Rect, Group} from 'react-konva';
import {GameOptions} from '../shared/shooter_interfaces';
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
				draggable={true}
			>
				<Circle
					radius={GameOptions.playerRadius}
					fill={shooter.colour}
					rotation={b.angle}
				/>		
				<Rect
					id='gun'
					x={-0.5 * shooter.gunWidth}
					y={-Math.sqrt(2) * GameOptions.playerRadius - shooter.gunLength}
					width={shooter.gunWidth}
					height={shooter.gunLength}
					fill={shooter.gunColour}
				/>
				<Circle
					id='left-hand'
					//x={-GameOptions.playerRadius / (Math.sqrt(2))}
					//y={-GameOptions.playerRadius / (Math.sqrt(2))}
					y={-GameOptions.playerRadius}
					radius={5}
					fill='white'
					rotation={b.angle}
					draggable={true}
				/>
				<Ellipse
					id='right-hand'
					width={shooter.handRadius * 2}
					height={shooter.handRadius * 2}
					x={shooter.gunWidth}
					y={-2 * GameOptions.playerRadius}
					//height={GameOptions.playerRadius}
					//x={Math.sqrt((GameOptions.playerRadius ** 2) / 8)}
					//y={-3 * Math.sqrt((GameOptions.playerRadius ** 2) / 8)}
					//rotation={-45}
					fill={shooter.handColour}
					draggable={true}
				/>
			</Group>
		)
	}
}