import React, { Fragment } from 'react';

import { AppContext } from "../redux/AppContext";

import { IUTXO, get_total_balance_including_tokens } from '../scripts/walletConnector';

import AssetsSelected from "./create_inheritance_form/AssetsSelected";

import '../css/WalletModal.css';

const NautilusLogo: string = require("../icons/nautilus-logo-icon.svg").default;

declare const ergoConnector: {
	nautilus: {
		connect(settings: { createErgoObject: boolean } | undefined): Promise<boolean>;
		isConnected(): Promise<boolean>;
		disconnect(): Promise<boolean>;
		getContext(): Promise<object>;
	};
};

function WalletModal(props: any) {

	const { state, dispatch } = React.useContext(AppContext);

	function checkIfNautilusAvailable() {
		return (typeof ergoConnector !== "undefined");
	}

	function NautilusConnectHandler() {


		ergoConnector.nautilus.connect({ createErgoObject: false }).then((result) => {

			if (!result) {
				console.log("rejected");
				return;
			}

			dispatch({ type: "wallet_set_connected", payload: true });

			ergoConnector.nautilus.getContext().then((context: any) => {
				context.get_change_address().then((address: string) => {
					dispatch({ type: "wallet_set_address", payload: address });
				});


				context.get_utxos().then((utxos: IUTXO[]) => {

					get_total_balance_including_tokens(utxos).then((res) => {

						dispatch({ type: "wallet_set_balance", payload: res });
						props.setWalletModalOpened(false);

					});

				});

			});

		});

	}

	function disconnectButtonHandler() {
		dispatch({ type: "wallet_reset" });
		props.setWalletModalOpened(false);
	}

	return (
		<div className="wallet-modal">
			<div className="wallet-modal-content">
				<span className="wallet-modal-close" onClick={props.closeHandler}>&times;</span>
				{
					!state.wallet.connected ?
						<Fragment>
							<h2>Select a wallet</h2>
							<p>Currently only Nautilus Wallet is supported.</p>
							{checkIfNautilusAvailable() ?
								<button className="wallet-modal-wallet-button" onClick={NautilusConnectHandler}>
									<p>Nautilus Wallet</p>
									<img src={NautilusLogo} alt="" />
								</button>
								: <p>Sorry, It seems that you don't have Nautilus Wallet installed!</p>
							}
						</Fragment>
						:
						<Fragment>
							<h2>Connected wallet:</h2>
							<p>{state.wallet.address}</p>
							<p>Assets:</p>
							<AssetsSelected
								assets={{
									ergs: state.wallet.balance.nanoErgs,
									tokens: state.wallet.balance.tokens
								}}
							/>
							<button className="wallet-modal-disconnect-button" onClick={disconnectButtonHandler}>
								Disconnect wallet
							</button>
						</Fragment>
				}


			</div>
		</div>
	);

}

export default WalletModal;
