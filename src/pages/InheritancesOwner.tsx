import React, { useState, useEffect } from "react";

import { Navigate, useSearchParams } from "react-router-dom";

import {
	get_box_containing_nft, get_nft_box_balance, IBalanceWithTokens
} from "../scripts/walletConnector";

import { ITxSent, TX_SENT_DEFAULT_STATE } from "../components/CreateInheritanceForm";

import AssetsSelected from "../components/create_inheritance_form/AssetsSelected";

import WithdrawalForm from "../components/WithdrawalForm";

import { AppContext } from "../redux/AppContext";

import "../css/CreateInheritanceForm.css";

function InheritanceOwnerPage() {

	const { state } = React.useContext(AppContext);

	const [inheritanceBalance, setInheritanceBalance] = useState<IBalanceWithTokens>(
		{
			nanoErgs: 0,
			tokens: []
		}
	);

	const [txSent, setTxSent] = useState<ITxSent>(TX_SENT_DEFAULT_STATE);

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

			<WithdrawalForm inheritanceId={inheritance_id} setTxSent={setTxSent} />

		</div>
	);

}

export default InheritanceOwnerPage;
