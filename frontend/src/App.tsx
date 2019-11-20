import React, { ReactElement } from 'react';
import Canvas from './Canvas';
import Header from './Header';
import './App.scss';
import { DumbAgent, StampedeBot, realPlayer } from './shared/dumb_bot';
import { gameLoop } from './shared/gameLoop';
import { GameState } from "./shared/interfaces";
import { GameOptions } from './shared/shooter_interfaces';
import { ShooterGame } from './shared/shooter_imp';
import { computeLoop, doEvent } from './computeLoop';
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
		this.handleClick = this.handleClick.bind(this);
	}

	// private playerAgent = new RealPlayer()
	private player = realPlayer();

	handleClick() {
		if (!this.state.growing) {
			this.setState({
				growing: true,
				shrinking: false
			});
			setTimeout(() => {
				this.setState({
					growing: false,
					full_screen: true
				})
			}, 1000);
		}
		else setTimeout(() => {
			this.setState({
				growing: false,
				shrinking: true
			});
			this.setState({
				shrinking: false,
				full_screen: false
			})
		}, 1000);

	}

	async componentDidMount(){
		document.addEventListener("keydown", this.player[1]);
		document.addEventListener("keyup", this.player[0]);
		let canvas = this.refs.container;
		let expando = <img
			className='expando'
			src={expando_img}
			onClick={this.handleClick}
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
		doEvent(
			agent1,
			{
				render: (state: GameState) => ref.current && ref.current.updateState(state),
				redeploy: (state: GameState) => ref.current && ref.current.redeploy(state)
			},
			GameOptions.fps,
			false
		)
		computeLoop()

		let name = 'App';
		if (this.state.growing) name += '.growing';
		if (this.state.shrinking) name += '.shrinking';
		if (this.state.full_screen) name += '.full-screen';
		return (
			<>
				<div className='Background'>
					<div className='Wallpaper'/>
				</div>
				<Header/>
				<br />
				<div className='Column'>
					<div
						className={name}
						id='container'
						ref='container'
					>
						{<Canvas ref={ref}/>}
						{/*this.state.expando*/}
					</div>
					<div id='container'>
						<h2>
							Our story
						</h2>
						<a href='https://devpost.com/software/ender-s-compute'>
							https://devpost.com/software/ender-s-compute
						</a>
					</div>
				</div>
			</>			
		);
	}
}

export default App;