import React from 'react';
import { Stage, Layer, Rect} from 'react-konva';

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
		state = Object.assign(state, {
			scale: (this.state.scale + this.getScale(state)) / 2
		});
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
		let xs = state.players.map(b => b.x);
		let rangeX = Math.max(...xs) - Math.min(...xs) + 20;
		let ys = state.players.map(b => b.y);
		let rangeY = Math.max(...ys) - Math.min(...ys) + 20;
		let scaleX = state.surface.width / rangeX;
		let scaleY = state.surface.height / rangeY;
		//accounts for limits of zoom out
		let scale = Math.max(Math.min(scaleX, scaleY), state.surface.width / GameOptions.gameWidth, state.surface.height / GameOptions.gameHeight);
		if (isNaN(scale)) scale = 1;
		return scale;
	}

	render() {
		return <Stage {...this.state.surface} scale={{
			x: this.state.scale,
			y: this.state.scale
		}}>
			<Layer id='background'>				
				<Rect
					x={background.x}
					y={background.y}
					width={Math.min(this.state.surface.width / this.state.scale, GameOptions.gameWidth)}
					height={Math.min(this.state.surface.height / this.state.scale, GameOptions.gameHeight)}
					fill={background.colour}
				/>
			</Layer>
			<Layer id='grid'>				
				<Grid
					width={Math.min(this.state.surface.width / this.state.scale, GameOptions.gameWidth)}
					height={Math.min(this.state.surface.height / this.state.scale, GameOptions.gameHeight)}
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