import React from 'react';
import {Link} from 'react-router-dom';

const Links = [
	['Our story', 'container']
]

export default class Header extends React.Component {

	render() {
		return (
			<div className='Header'>
				<a href={process.env.PUBLIC_URL}>
					<h1>ENDER'S COMPUTATION</h1>
				</a>
			</div>
		)
	}
}