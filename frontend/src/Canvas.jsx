import React, {useState} from 'react';
import { Stage, Layer, Rect, Text, Circle } from 'react-konva';
import Konva from 'konva';

import Shooter from './Objects/Shooter.jsx';
import Bullet from './Objects/Bullet.jsx';

export default class Canvas extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			surface: {
				width: 1920,
				height: 1080,
				left: 0,
				top: 0,
			},
			layer: {
				fill: 'green'
			},
			shooters: [
				{
					x: 50,
					y: 50
				},				
				{
					x: 200,
					y: 200
				}
			],
			bullets: [
				{
					x: 80,
					y: 80,
					angle: 45
				},
				{
					x: 90,
					y: 90,
					angle: 45
				},
				{
					x: 100,
					y: 100,
					angle: 45
				}
			]
		}
	}

	componentDidMount() {
		const canvas = this.refs.canvas;
		this.checkSize();
		window.addEventListener('resize', this.checkSize);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.checkSize);
	}

	checkSize () {
		let state = this.state;
		state.surface.width = window.innerWidth;
		state.surface.height = window.innerHeight;
		this.setState(state);
	}

	componentDidUpdate() {
		console.log(this.refs);
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
					x={0}
					y={0}
					width={this.state.surface.width}
					height={this.state.surface.height}
					fill='#608038'
					style={{
						display: 'none'
					}}
				/>
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