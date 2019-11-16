import React from 'react';
import {Rect} from 'react-konva';

export default class Bullet extends React.Component {

	render() {
		let b = this.props.data;
		return (
			<Rect
				x={b.x}
				y={b.y}
				width={5}
				height={2}
				fill='#080808'
				rotation={b.angle}
			/>
		)
	}
}