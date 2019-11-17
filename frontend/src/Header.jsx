import React from 'react';
import {Link} from 'react-router-dom';

const Links = [
	['Our story', 'container'],
	['Technologies', 'technologies']
]

export default class Header extends React.Component {

	render() {
		return (
			<div className='Header'>
				<a href={window.location.href.slice(0, -window.location.pathname.length)}>
					<h1>ENDER'S COMPUTATION</h1>
				</a>
				{Links.map(([title, id]) => {
					return (
						<a href={window.location.href.slice(0, -window.location.pathname.length)+ '#' + id}>
							<h2>{title}</h2>
						</a>
					)
				})}
				<img id='mlh' src='https://s3.amazonaws.com/logged-assets/trust-badge/2020/mlh-trust-badge-2020-white.svg'/>
			</div>
		)
	}
}