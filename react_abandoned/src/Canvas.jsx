import React from 'react';

class Canvas extends React.Component {

	constructor(props) {
		super(props);
	}

	componentDidUpdate() {
		console.log(this.refs);
		const canvas = this.refs.canvas;
		let ctx = canvas.getContext('2d');
		ctx.beginPath();
		ctx.rect(20, 40, 50, 50);
		ctx.fillStyle = "#FF0000";
		ctx.fill();
		ctx.closePath();
		console.log(ctx);
	}

	render() {
		return <canvas ref='canvas' />;
	}
}

export default Canvas;