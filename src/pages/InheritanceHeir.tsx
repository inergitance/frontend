import React, { useState, useEffect } from "react";

import { Navigate, useSearchParams } from "react-router-dom";

import {
	get_box_containing_nft, get_nft_box_balance, IBalanceWithTokens, get_box_to_spend, INFTBox, IUTXOToken
} from "../scripts/walletConnector";

import {
	create_transaction_phase1_to_phase2, sign_tx, submit_tx, INautilusUTXO
} from "../scripts/transactionsBuilder";

import { ITxSent, TX_SENT_DEFAULT_STATE } from "../components/CreateInheritanceForm";

import AssetsSelected from "../components/create_inheritance_form/AssetsSelected";

import { AppContext } from "../redux/AppContext";

import "../css/CreateInheritanceForm.css";

//todo split UI to support 2 required withdrawal phases

async function construct_and_sign_phase1_to_phase2_transaction(
	box: INFTBox
): Promise<string | null> {

	const bx: INautilusUTXO = await get_box_to_spend(box.boxId);
	const tkns: IUTXOToken[] = bx.assets;

	const unsigned_tx = await create_transaction_phase1_to_phase2(
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

function InheritanceHeirPage() {

	const { state } = React.useContext(AppContext);

	const [inheritanceBalance, setInheritanceBalance] = useState<IBalanceWithTokens>(
		{
			nanoErgs: 0,
			tokens: []
		}
	);

	const [txSent, setTxSent] = useState<ITxSent>(TX_SENT_DEFAULT_STATE);

	const [phaseNumber, setPhaseNumber] = useState<number>(0);

	const [searchParams] = useSearchParams();

	const inheritance_id = searchParams.get("id");

	useEffect(() => {
		if (inheritance_id !== null)
			get_box_containing_nft(inheritance_id).then(result => {
				if (result === null || result.phase < 1 || result.phase > 3)
					return (<Navigate to="/my-inheritance" />);
				setPhaseNumber(result.phase);
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

	function withdrawP1P2AssetsHandler(e: React.MouseEvent<HTMLElement>) {
		e.preventDefault();
		if (inheritance_id !== null) {
			get_box_containing_nft(inheritance_id).then(result => {
				if (result !== null) {
					construct_and_sign_phase1_to_phase2_transaction(result).then(res => {
						if (res == null) alert("Transaction sending failed!");
						else {
							setTxSent({ sent: true, txId: res });
						}
					});
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

	//todo fix UI in P1 to P2

	return (

		<div>

			<h2>You are heir of inheritance containing following assets:</h2>

			{
				(inheritanceBalance.nanoErgs === 0) ?
					<h2>Loading ...</h2>
					:
					<AssetsSelected assets={{
						ergs: inheritanceBalance.nanoErgs,
						tokens: inheritanceBalance.tokens
					}} />
			}

			{

				(phaseNumber === 1) ?

					<div className="inheritance-form-main-div">
						<h2 className="inheritance-form-heading">Inheritance withdrawal form</h2>
						<form action="">

							<p>Inheritance is currently in Phase1 - it means that you (as it's heir) need to first withdraw it to the Phase2</p>
							<p>Then you need to wait some time (TODO time ???) and then withdraw it from Phase2 to your wallet.</p>
							<p>By taping on the button bellow you can initiate the withdrawal process from Phase1 to Phase2</p>

							<button onClick={withdrawP1P2AssetsHandler} className="create-inheritance-form-button">
								Initiate withdrawal
							</button>

						</form>
					</div>

					: <p>TODO</p>


			}


		</div >
	);

}

export default InheritanceHeirPage;
