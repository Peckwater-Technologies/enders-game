import React from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';

import Shooter from './Objects/Shooter';
import Bullet from './Objects/Bullet';
import Tree from './Objects/Tree';
import Grid from './Objects/Grid';

import {randBetween} from './utils/random';

import config from './config.json';
import defaults from './defaults.json';

import {GameOptions} from './shared/shooter_interfaces';

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
		/*setInterval(() => this.updateState({
			players: implement(defaults.players),
			bullets: implement(defaults.bullets)
		}), 1000 / config.frameRate);*/
	}

	setEnv(props) {

	}

	updateState(ShooterState) {
		let state = Object.assign(this.state, ShooterState);
		let [scale, minX, minY] = this.getScale(state);
		state = Object.assign(state, { scale, minX, minY });
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

	getTrees() {
		if (this._trees) return this._trees;
		let trees = [];
		for (let i = 0; i < this.state.trees; i++) {
			trees.push(<Tree
				key={['tree', i].join('.')}
			/>);
		}
		return this._trees = trees;
	}

	getScale(state) {
		let x0 = state.players[0].x; let y0 = state.players[0].y;
		let x1 = state.players[1].x; let y1 = state.players[1].y;

		const PADDING = 50 + GameOptions.playerRadius;
		let minX = Math.min(x0, x1) - PADDING;
		let minY = Math.min(y0, y1) - PADDING;
		let rangeX = Math.abs(x1 - x0) + 2 * PADDING
		let rangeY = Math.abs(y1 - y0) + 2 * PADDING

		let scaleX = window.innerWidth / rangeX;
		let scaleY = window.innerHeight / rangeY;
		let scale = Math.min(Math.min(scaleX, scaleY), 2);
		if (isNaN(scale)) scale = 1;

		return [scale, minX - 10, minY - 10];
	}

	render() {
		console.log(this.state);
		return <Stage {...this.state.surface}
			x={-this.state.minX * this.state.scale}
			y={-this.state.minY * this.state.scale}
			scale={{
				x: this.state.scale,
				y: this.state.scale
			}}
		>
			<Layer id='background'>				
				<Rect
					width={GameOptions.gameWidth}
					height={GameOptions.gameHeight}
					fill={background.colour}
				/>
			</Layer>
			<Layer id='grid'>				
				<Grid
					width={GameOptions.gameWidth}
					height={GameOptions.gameHeight}
					freq={config.grid.freqWidth}
				/>
			</Layer>
			<Layer id='trees' {...this.state.layer}>
				{this.getTrees()}
			</Layer>
			<Layer id='players' {...this.state.layer}>			
				{this.state.players.map((b, i) => <Shooter
					key={['shooter', i].join('.')}
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