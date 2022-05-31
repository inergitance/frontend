import React from "react";

import { Link } from "react-router-dom";

import "../css/Home.css";

function HomePage() {

	return (
		<div className="home-page-div">
			<img src="./inergitance_logo.svg" alt="InERGitance - Decentralized inheritance solution"
				title="InERGitance - Decentralized inheritance solution" />
			<h1>Decentralized inheritance solution on Ergo blockchain</h1>
			<Link to="/how-it-works">
				<button>See how it works!</button>
			</Link>
		</div>
	);

}


export default HomePage;
