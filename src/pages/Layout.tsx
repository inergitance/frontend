import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../redux/AppContext";

import WalletModal from "../components/WalletModal";

import "../css/Layout.css";

function PageLayout(props: any) {

	const [walletModalOpened, setWalletModalOpened] = useState<boolean>(false);
	// const { state, dispatch } = React.useContext(AppContext);
	const { state } = React.useContext(AppContext);

	function connectWalletHandler() {
		if (!walletModalOpened) {
			setWalletModalOpened(true);
		} else {
			setWalletModalOpened(false);
		}
	}

	function showWalletHandler() {
		if (!walletModalOpened) {
			setWalletModalOpened(true);
		} else {
			setWalletModalOpened(false);
		}
	}

	return (
		<div id="layout">
			<div id="header">
				<Link to="/">
					<img src="./inergitance_logo.svg" alt="InERGitance - Decentralized inheritance solution"
						title="InERGitance - Decentralized inheritance solution" className="header-project-logo" />
				</Link>
				<ul>
					<li>
						<Link to="/about">About</Link>
					</li>
					<li>
						<Link to="/how-it-works">How It Works</Link>
					</li>
					{
						state.wallet.connected ?
							<li>
								<Link to="/my-inheritance">My Inheritance</Link>
							</li>
							: []
					}
				</ul>
				{
					state.wallet.connected ?
						<button className="show-wallet-btn" onClick={showWalletHandler}>{state.wallet.address}</button>
						:
						<button className="connect-wallet-btn" onClick={connectWalletHandler}>Connect wallet</button>
				}
			</div>
			{
				walletModalOpened ? <WalletModal closeHandler={connectWalletHandler}
					setWalletModalOpened={setWalletModalOpened} /> : []
			}
			<div id="main-content">
				{props.children}
			</div>
		</div>
	);

}

export default PageLayout;
