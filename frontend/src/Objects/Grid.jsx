import React from 'react';
import {Rect, Group} from 'react-konva';

import config from '../config.json';

export default class Grid extends React.Component {

	render() {
		const {height, width, freq} = this.props;
		let pixels = Math.ceil(width / freq);
		let horizontals = [];
		let verticals = [];
		for (let i = 0; i < freq; i++) {
			horizontals.push(<Rect
				key={['grid', 'horizontal', i].join('.')}
				x={pixels * i}
				width={2}
				height={height}
				fill='black'
				opacity={config.grid.transparency}
			/>)
		}
		for (let i = 0; i < Math.ceil(height / pixels); i++) {
			verticals.push(<Rect
				key={['grid', 'vertical', i].join('.')}
				y={pixels * i}
				height={1}
				width={width}
				fill='black'
				opacity={config.grid.transparency}
			/>)
		}
		return (
			<Group>
				{verticals}
				{horizontals}
			</Group>
		)
	}
}