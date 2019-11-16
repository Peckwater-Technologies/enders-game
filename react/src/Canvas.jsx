import React, {useState} from 'react';
import { Stage, Layer, Rect, Text, Circle } from 'react-konva';
import Konva from 'konva';

class Canvas extends React.Component {

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
			circle: {
				x: 1920 / 2,
				y: 1080 / 2,
				draggable: true,
				radius: 20,
				fill: Konva.Util.getRandomColor()
			}
		}
	}

	componentDidMount() {
		console.log(this.refs);
		const canvas = this.refs.canvas;
		this.checkSize();
		window.addEventListener('resize', this.checkSize);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.checkSize);
	}

	checkSize = () => {
		let state = this.state;
		state.surface.width = window.innerWidth;
		state.surface.height = window.innerHeight;
		this.setState(state);
	};

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
					fill='green'
				/>
			</Layer>
			<Layer {...this.state.layer}>
				<Circle {...this.state.circle}/>
				<Text text='Hello world'/>
			</Layer>
		</Stage>
	}
}

export default Canvas;