import React from 'react';
import Canvas from './Canvas';
import './App.css';

class App extends React.Component {

	render() {
		return (
			<div className="App">
			  	{<Canvas />}
			</div>
		);
	}
}

export default App;
