import React, { ReactElement } from 'react';
import Canvas from './Canvas';
import Header from './Header';
import './App.scss';
import { DumbAgent, StampedeBot, realPlayer } from './shared/dumb_bot';
import { MappedRLNetBot } from './shared/rl_bot';
import { gameLoop } from './shared/gameLoop';
import { GameOptions } from './shared/shooter_interfaces';
import { ShooterGame } from './shared/shooter_imp';
import expando_img from './assets/expando.png';

class App extends React.Component<{}, {
	expando: ReactElement | null,
	shrinking: Boolean,
	growing: Boolean,
	full_screen: Boolean
}> {

	constructor(props: Object) {
		super(props);
		this.state = {
			expando: null,
			shrinking: false,
			growing: false,
			full_screen: false
		}
	}

	// private playerAgent = new RealPlayer()
	private player = realPlayer();

	componentDidMount(){
		document.addEventListener("keydown", this.player[1]);
		document.addEventListener("keyup", this.player[0]);
		let canvas = this.refs.container;
		let expando = <img
			className='expando'
			src={expando_img}
			onClick={() => {
				console.log('hello world');
			}}
		/>;
		this.setState({
			expando
		});
	}
	
	componentWillUnmount(){
		document.removeEventListener("keydown", this.player[1]);
		document.removeEventListener("keyup", this.player[0]);
	}

	render() {
		let ref = React.createRef<Canvas>();
		let agent1 = this.player[2];
		let agent2 = new StampedeBot();
		gameLoop(ShooterGame, [agent1, agent2],
			{
				redeploy: state => ref.current && ref.current.redeploy(state),
				render: state => ref.current && ref.current.updateState(state)
			},
			GameOptions.fps
		)
		return (
			<>
				<div className='Background'>
					<div className='Wallpaper'/>
				</div>
				<Header/>
				<br />
				<div className='Column'>
					<div
						className={'App' + (this.state.growing ? '.growing' ? this.state.shrinking : '.shrinking' ? this.state.full_screen : '.full-screen' : '')}
						id='container'
						ref='container'
					>
						{<Canvas ref={ref}/>}
						{this.state.expando}
					</div>
				</div>
			</>			
		);
	}
}

export default App;