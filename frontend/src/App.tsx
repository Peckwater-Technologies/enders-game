import React from 'react';
import Canvas from './Canvas';
import './App.css';
import { DumbAgent, StampedeBot } from './shared/dumb_bot';
import { gameLoop } from './shared/gameLoop';
import { GameOptions } from './shared/shooter_interfaces';
import { ShooterGame } from './shared/shooter_imp';

class App extends React.Component {

	handleKeyPress(event: KeyboardEvent): void {
		console.log('hello world');
		console.log(event);
		if (event.keyCode === 38) {
			// up arrow
		}
		else
		if (event.keyCode === 40) {
			// down arrow
		}
		else
		if (event.keyCode === 37) {
		   // left arrow
		}
		else
		if (event.keyCode === 39) {
		   // right arrow
		}
	}

	componentDidMount(){
		document.addEventListener("keydown", this.handleKeyPress, false);
	}
	
	componentWillUnmount(){
		document.removeEventListener("keydown", this.handleKeyPress, false);
	}

	render() {
		let ref = React.createRef<Canvas>();

		let agent1 = new DumbAgent();
		let agent2 = new StampedeBot();

		gameLoop(ShooterGame, [agent1, agent2],
			{ render: state => ref.current && ref.current.updateState(state) },
			GameOptions.fps
		)

		return <div
			className="App"
			onKeyPress={this.handleKeyPress}
			onKeyDown={this.handleKeyPress}
			onKeyUp={this.handleKeyPress}
			id='container'
			ref='container'
		> {
			<Canvas ref={ref} />
		} </div>;
	}
}

export default App;