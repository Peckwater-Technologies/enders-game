import React from 'react';
import Canvas from './Canvas';
import './App.css';
import { DumbAgent, StampedeBot, realPlayer } from './shared/dumb_bot';
import { gameLoop } from './shared/gameLoop';
import { GameOptions } from './shared/shooter_interfaces';
import { ShooterGame } from './shared/shooter_imp';

class App extends React.Component {

	// private playerAgent = new RealPlayer()
	private player = realPlayer();

	componentDidMount(){
		document.addEventListener("keydown", this.player[1]);
		document.addEventListener("keyup", this.player[0]);
	}
	
	componentWillUnmount(){
		document.removeEventListener("keydown", this.player[1]);
		document.removeEventListener("keyup", this.player[0]);
	}

	render() {
		let ref = React.createRef<Canvas>();

		// let agent1 = this.playerAgent;
		let agent1 = this.player[2];
		let agent2 = new StampedeBot();

		gameLoop(ShooterGame, [agent1, agent2],
			{ render: state => ref.current && ref.current.updateState(state) },
			GameOptions.fps
		)

		return <div
				className="App"
				id='container'
				ref='container'
			>
			{ <Canvas ref={ref} /> }
		</div>;
	}
}

export default App;