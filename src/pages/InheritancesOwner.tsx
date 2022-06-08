import React, { useState, useRef, useEffect } from "react";

import { Navigate, useSearchParams } from "react-router-dom";

import {
	get_box_containing_nft, get_nft_box_balance, IBalanceWithTokens, get_box_to_spend, INFTBox, IUTXOToken
} from "../scripts/walletConnector";

import {
	validate_address, create_transaction_owner_withdrawal, sign_tx, submit_tx, INautilusUTXO
} from "../scripts/transactionsBuilder";

import { ITxSent, TX_SENT_DEFAULT_STATE } from "../components/CreateInheritanceForm";

import AssetsSelected from "../components/create_inheritance_form/AssetsSelected";

import { AppContext } from "../redux/AppContext";

import "../css/CreateInheritanceForm.css";

async function construct_and_sign_withdrawal_transaction(box: INFTBox, address: string): Promise<string | null> {

	const bx: INautilusUTXO = await get_box_to_spend(box.boxId);
	const tkns: IUTXOToken[] = bx.assets;

	const unsigned_tx = await create_transaction_owner_withdrawal(
		address,
		bx,
		box.nftId,
		parseInt(bx.value),
		tkns
	);

	const signed_tx = await sign_tx(unsigned_tx);
	if (!signed_tx) return null;

	const sent_tx = await submit_tx(signed_tx);
	if (!sent_tx) return null;

	return sent_tx;
}

function InheritanceOwnerPage() {

	const { state } = React.useContext(AppContext);

	const [inheritanceBalance, setInheritanceBalance] = useState<IBalanceWithTokens>(
		{
			nanoErgs: 0,
			tokens: []
		}
	);

	const [txSent, setTxSent] = useState<ITxSent>(TX_SENT_DEFAULT_STATE);

	const withdrawalAddressInputElement = useRef<HTMLInputElement>(null);

	const [searchParams] = useSearchParams();

	const inheritance_id = searchParams.get("id");

	useEffect(() => {
		if (inheritance_id !== null)
			get_box_containing_nft(inheritance_id).then(result => {
				if (result === null)
					return (<Navigate to="/my-inheritance" />);
			});
	});

	if (!state.wallet.connected || !state.inheritances.loaded) {
		return <Navigate to="/" />
	}

	if (inheritance_id === null || inheritance_id === "") {
		return <Navigate to="/" />
	}

	if (inheritanceBalance.nanoErgs === 0) {
		get_nft_box_balance(inheritance_id).then(
			(result: IBalanceWithTokens) => setInheritanceBalance(result)
		);
	}

	function addressesChangedHandler() {

	}

	function useCurrentAddressHandler(e: React.MouseEvent<HTMLElement>) {
		e.preventDefault();
		if (withdrawalAddressInputElement.current) {
			withdrawalAddressInputElement.current.value = state.wallet.address;
			addressesChangedHandler();
		}
	}

	function withdrawAssetsHandler(e: React.MouseEvent<HTMLElement>) {
		e.preventDefault();
		if (withdrawalAddressInputElement.current) {
			validate_address(withdrawalAddressInputElement.current.value).then((result: boolean) => {
				if (result && inheritance_id !== null) {
					get_box_containing_nft(inheritance_id).then(result => {
						if (result !== null) {
							construct_and_sign_withdrawal_transaction(result,
								withdrawalAddressInputElement.current!.value
							).then(res => {
								if (res == null) alert("Transaction sending failed!");
								else {
									setTxSent({ sent: true, txId: res });
								}
							});
						}
					});

				} else {
					alert("Invalid withdrawal address!");
				}
			});
		}
	}

	if (txSent.sent) {
		return (
			<div>
				<h3>Transaction&nbsp;
					<a href={"https://testnet.ergoplatform.com/en/transactions/" + txSent.txId}
						target="_blank" rel="noopener norefferer">
						{txSent.txId}
					</a>
					&nbsp;was successfully sent! :-)</h3>
			</div>
		);
	}

	return (

		<div>

			<h2>Inheritance owned by you contains following assets:</h2>

			{
				(inheritanceBalance.nanoErgs === 0) ?
					<h2>Loading ...</h2>
					:
					<AssetsSelected assets={{
						ergs: inheritanceBalance.nanoErgs,
						tokens: inheritanceBalance.tokens
					}} />
			}

			<div className="inheritance-form-main-div">
				<h2 className="inheritance-form-heading">Inheritance withdrawal form</h2>
				<form action="">

					<div className="inheritance-form-subsection-div">
						<h3 className="inheritance-form-heading">Address:</h3>
						<hr />
						<input type="text" placeholder="Withdrawal address"
							onChange={addressesChangedHandler} ref={withdrawalAddressInputElement}
						/>
						<button onClick={useCurrentAddressHandler} className="create-inheritance-form-button">
							Use current address
						</button>
					</div>

					<button onClick={withdrawAssetsHandler} className="create-inheritance-form-button">
						Withdraw assets
					</button>

				</form>
			</div>

		</div>
	);

}

export default InheritanceOwnerPage;
