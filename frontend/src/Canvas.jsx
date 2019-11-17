import React from 'react';
import { Stage, Layer, Rect} from 'react-konva';

import Shooter from './Objects/Shooter';
import Bullet from './Objects/Bullet';
import Tree from './Objects/Tree';

import {randBetween} from './utils/random';

import config from './config.json';
import defaults from './defaults.json';

const {background} = config;

export default class Canvas extends React.Component {

	constructor(props) {
		super(props);
		this.checkSize = this.checkSize.bind(this);
		this.newPosition = this.newPosition.bind(this);
		defaults.surface.width = window.innerWidth;
		defaults.surface.height = window.innerHeight;
		this.state = implement(defaults);
		this.state.rand = Math.random();
		//setInterval(this.newPosition, 1000 / config.frameRate)
	}

	newPosition() {
		console.log('hello');
		this.setState(implement(defaults));
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
					rand={this.state.rand}
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

function implement(obj) {
	let res = {};
	for (let [k, v] of Object.entries(obj)) {
		if (typeof v !== 'object') res[k] = v;
		else {
			if (Array.isArray(v)) {
				if (!v.every(value => typeof value === 'number')) {
					let arr = [];
					for (let value of v) {
						if (typeof value !== 'object') arr.push(value);
						else arr.push(implement(value));
					}
					res[k] = arr;
				}
				else res[k] = randBetween(v[0], v[1]);
			} else res[k] = implement(v);
		}
	}
	return res;
}