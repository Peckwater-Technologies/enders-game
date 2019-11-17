import React from 'react';
import { Stage, Layer, Rect} from 'react-konva';

import Shooter from './Objects/Shooter';
import Bullet from './Objects/Bullet';
import Tree from './Objects/Tree';
import Grid from './Objects/Grid';

import {randBetween} from './utils/random';

import config from './config.json';
import defaults from './defaults.json';

const {background} = config;

export default class Canvas extends React.Component {

	constructor(props) {
		super(props);
		this.checkSize = this.checkSize.bind(this);
		this.updateState = this.updateState.bind(this);
		defaults.surface.width = window.innerWidth;
		defaults.surface.height = window.innerHeight;
		this.state = implement(defaults);
		this.state.rand = Math.random();
		setInterval(() => this.updateState({
			players: implement(defaults.players),
			bullets: implement(defaults.bullets)
		}), 1000 / config.frameRate);
	}

	setEnv(props) {

	}

	updateState(assignee) {
		let state = Object.assign(this.state, assignee);
		this.setState(state);
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
		return <Stage {...this.state.surface}>
			<Layer id='background'>				
				<Rect
					x={background.x}
					y={background.y}
					width={this.state.surface.width}
					height={this.state.surface.height}
					fill={background.colour}
				/>
			</Layer>
			<Layer id='grid'>				
				<Grid
					width={this.state.surface.width}
					height={this.state.surface.height}
					freq={config.grid.freqWidth}
				/>
			</Layer>
			<Layer id='trees' {...this.state.layer}>
				{this.state.trees.map((b, i) => <Tree
					key = {['tree', i].join('.')}
					data={b}
					rand={this.state.rand}
				/>)}
			</Layer>
			<Layer id='players' {...this.state.layer}>			
				{this.state.players.map((b, i) => <Shooter
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
	if (Array.isArray(obj)) {
		if (!obj.every(value => typeof value === 'number')) {
			let arr = [];
			for (let value of obj) {
				if (typeof value !== 'object') arr.push(value);
				else arr.push(implement(value));
			}
			return arr;
		}
		else return randBetween(obj[0], obj[1]);
	}
	let res = {};
	for (let [k, v] of Object.entries(obj)) {
		if (typeof v !== 'object') res[k] = v;
		else res[k] = implement(v);
	}
	return res;
}