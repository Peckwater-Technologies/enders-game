import React from 'react';
import { Stage, Layer, Rect} from 'react-konva';

import Shooter from './Objects/Shooter';
import Bullet from './Objects/Bullet';
import Tree from './Objects/Tree';

import config from './config.json';
import defaults from './defaults.json';

const {background} = config;

export default class Canvas extends React.Component {

	constructor(props) {
		super(props);
		this.checkSize = this.checkSize.bind(this);
		this.state = defaults;
	}

	componentDidMount() {
		this.checkSize();
		window.addEventListener('resize', this.checkSize);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.checkSize);
	}

	checkSize() {
		let state = this.state;
		state.surface.width = window.innerWidth;
		state.surface.height = window.innerHeight;
		this.setState(state);
	}

	componentDidUpdate() {
		const canvas = this.refs.canvas;/*
		let ctx = canvas.getContext('2d');
		ctx.beginPath();
		ctx.rect(20, 40, 50, 50);
		ctx.fillStyle = "#FF0000";
		ctx.fill();
		ctx.closePath();
		console.log(ctx);*/
	}

	render() {
		return <Stage {...this.state.surface} ref='canvas' >
			<Layer id='background'>				
				<Rect
					x={background.x}
					y={background.y}
					width={this.state.surface.width}
					height={this.state.surface.height}
					fill={background.colour}
				/>
			</Layer>
			<Layer id='trees' {...this.state.layer}>
				{this.state.trees.map((b, i) => <Tree
					key = {['tree', i].join('.')}
					data={b}
				/>)}
			</Layer>
			<Layer id='shooters' {...this.state.layer}>			
				{this.state.shooters.map((b, i) => <Shooter
					key = {['shooter', i].join('.')}
					data={b}
				/>)}
			</Layer>
			<Layer id='bullets' {...this.state.layer}>
				{this.state.bullets.map((b, i) => <Bullet
					key = {['bullet', i].join('.')}
					data={b}
				/>)}
			</Layer>
		</Stage>
	}
}