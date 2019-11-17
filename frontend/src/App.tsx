import React from 'react';
import Canvas from './Canvas';
import './App.css';
import { DumbAgent, StampedeBot } from './shared/dumb_bot';
import { gameLoop } from './shared/gameLoop';
import { GameOptions } from './shared/shooter_interfaces';
import { ShooterGame } from './shared/shooter_imp';

class App extends React.Component {

	render() {
		let ref = React.createRef<Canvas>();

		let agent1 = new DumbAgent();
		let agent2 = new StampedeBot();

		gameLoop(ShooterGame, [agent1, agent2],
			{ render: state => ref.current && ref.current.updateState(state) },
			GameOptions.fps
		)

		return <div className="App"> {
			<Canvas ref={ref} />
		} </div>;
	}
}

export default App;