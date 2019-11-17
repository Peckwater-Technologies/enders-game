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
		let [actual, centreX, centreY, rangeX, rangeY] = this.getScale(state);
		state = Object.assign(state, {
			scale: Math.min(Math.min((this.state.scale + actual) / 2), GameOptions.gameWidth / config.minWidth),
			minX, minY
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
		let minX = Math.min(...xs);
		if (isNaN(minX)) minX = 0;
		let rangeX = Math.max(...xs) - minX;
		let ys = state.players.map(b => b.y);
		let minY = Math.min(...ys);
		if (isNaN(minY)) minY = 0;
		let rangeY = Math.max(...ys) - minY;
		let scaleX = GameOptions.gameWidth / (rangeX + 20);
		let scaleY = GameOptions.gameHeight / (rangeY + 20);
		//accounts for limits of zoom out
		let centreX = rangeX * 0.5 + minX;
		let centreY = rangeY * 0.5 + minY;
		let scale = Math.max(Math.min(scaleX, scaleY), state.surface.width / GameOptions.gameWidth, state.surface.height / GameOptions.gameHeight);
		if (isNaN(scale)) scale = 1;
		return [scale, centreX, centreY, rangeX, rangeY];
	}

	render() {
		let theoreticalX = GameOptions.gameWidth / this.state.scale;
		let calculatedXOffset = Math.min(this.state.minX, GameOptions.gameWidth - theoreticalX);
		let theoreticalY = GameOptions.gameHeight / this.state.scale;
		let calculatedYOffset = Math.min(this.state.minY, GameOptions.gameHeight - theoreticalY);
		
		console.log(theoreticalX, theoreticalY, this.state.scale);
		return <Stage {...this.state.surface} /*
			x={-calculatedXOffset}
			y={-calculatedYOffset}
			scale={{
				x: this.state.scale,
				y: this.state.scale
			}}*/
		>
			<Layer id='background'>				
				<Rect
					width={GameOptions.gameWidth}
					height={GameOptions.gameHeight}
					//width={theoreticalX}
					//height={theoreticalY}
					fill={background.colour}
				/>
			</Layer>
			<Layer id='grid'>				
				<Grid
					width={GameOptions.gameWidth}
					height={GameOptions.gameHeight}
					//width={theoreticalX}
					//height={theoreticalY}
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
			<Layer>
				<Rect
					width={theoreticalX}
					height={theoreticalY}
					x={calculatedXOffset}
					y={calculatedYOffset}
					strokeWidth={10}
					stroke='black'
				/>
				<Text x={0} y={0} fontSize={100} text={`
				Size: (${theoreticalX}, ${theoreticalY})
				Offset: (${calculatedXOffset}, ${calculatedYOffset})
				Minimum: (${this.state.minX}, ${this.state.minY})
				`}/>
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