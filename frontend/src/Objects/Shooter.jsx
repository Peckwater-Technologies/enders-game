import React from 'react';
import {Circle} from 'react-konva';

export default class Bullet extends React.Component {

	render() {
		let b = this.props.data;
		return (
			<Circle
				x={b.x}
				y={b.y}
				width={20}
				height={20}
				fill='dark green'
				rotation={b.angle}
				draggable={true}
			/>
		)
	}
}