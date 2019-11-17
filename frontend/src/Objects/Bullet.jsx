import React from 'react';
import {Circle, Group} from 'react-konva';

import {GameOptions} from '../shared/shooter_interfaces';
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
				<Circle
					radius={GameOptions.bulletRadius}
					fill={bullet.colour}
				/>
			</Group>
		)
	}
}