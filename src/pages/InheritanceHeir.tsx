import React, { useState, useEffect } from "react";

import { Navigate, useSearchParams } from "react-router-dom";

import {
	get_box_containing_nft, get_nft_box_balance, IBalanceWithTokens, get_box_to_spend, INFTBox, IUTXOToken,
	get_box_to_spend_original_json
} from "../scripts/walletConnector";

import {
	create_transaction_phase1_to_phase2, sign_tx, submit_tx, INautilusUTXO, get_block_height
} from "../scripts/transactionsBuilder";

import { ITxSent, TX_SENT_DEFAULT_STATE } from "../components/CreateInheritanceForm";

import { block_difference_to_time, time_to_text } from "../scripts/timeUtils";

import AssetsSelected from "../components/create_inheritance_form/AssetsSelected";

import WithdrawalForm from "../components/WithdrawalForm";

import { AppContext } from "../redux/AppContext";

import "../css/CreateInheritanceForm.css";

//todo make css for withdrawal waiting needed warning

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

//todo, maybe move all those "helper" functions somewhere outside of this module

let ergolib = import("ergo-lib-wasm-browser");

async function get_box_withdrawal_delay(boxId: string): Promise<number | null> {

	const box_json = await get_box_to_spend_original_json(boxId);

	let wasm = (await ergolib);

	const wasm_box = wasm.ErgoBox.from_json(box_json);

	const box_r7_value = wasm_box.register_value(7);

	if (typeof box_r7_value === "undefined") return null;

	return box_r7_value.to_i32();

}

async function todo_inclusion_height(boxId: string): Promise<number | null> {
	return JSON.parse(await get_box_to_spend_original_json(boxId)).settlementHeight;
}

async function get_box_withdrawal_block_height(boxId: string): Promise<number | null> {

	const inclusion_height = await todo_inclusion_height(boxId);
	if (inclusion_height === null) return null;

	const withdrawal_delay = await get_box_withdrawal_delay(boxId);
	if (withdrawal_delay === null) return null;

	return inclusion_height + withdrawal_delay;

}

interface IWithdrawalTime {
	loaded: boolean,
	current_block_height: number,
	withdrawal_delay: number,
	withdrawal_block_height: number
}

const WITHDRAWAL_TIME_DEFAULT_STATE: IWithdrawalTime = {
	loaded: false,
	current_block_height: 0,
	withdrawal_delay: 0,
	withdrawal_block_height: 0
};

async function get_withdrawal_time(box: INFTBox): Promise<IWithdrawalTime | null> {

	const result: IWithdrawalTime = WITHDRAWAL_TIME_DEFAULT_STATE;

	result.current_block_height = await get_block_height();

	const withdrawal_delay = await get_box_withdrawal_delay(box.boxId);
	if (withdrawal_delay === null) return null;
	result.withdrawal_delay = withdrawal_delay;

	const withdrawal_block_height = await get_box_withdrawal_block_height(box.boxId);
	if (withdrawal_block_height === null) return null;
	result.withdrawal_block_height = withdrawal_block_height;

	result.loaded = true;

	return result;

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

	const [withdrawalTime, setWithdrawalTime] = useState<IWithdrawalTime>(WITHDRAWAL_TIME_DEFAULT_STATE);

	const [searchParams] = useSearchParams();

	const inheritance_id = searchParams.get("id");

	useEffect(() => {
		if (inheritance_id !== null)
			get_box_containing_nft(inheritance_id).then(result => {
				if (result === null || result.phase < 1 || result.phase > 3)
					return (<Navigate to="/my-inheritance" />);
				setPhaseNumber(result.phase);
				get_withdrawal_time(result).then(res => {
					if (res !== null) setWithdrawalTime(res);
				});
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

					: (phaseNumber === 2) ?

						(!withdrawalTime.loaded) ?

							<h2>Loading withdrawal details...</h2>

							: (withdrawalTime.current_block_height < withdrawalTime.withdrawal_block_height) ?

								<div>
									Heir withdrawal was successfully initiated. However you still need to wait for&nbsp;
									{withdrawalTime.withdrawal_block_height - withdrawalTime.current_block_height} blocks (approx. {
										time_to_text(
											block_difference_to_time(
												withdrawalTime.withdrawal_block_height - 
												withdrawalTime.current_block_height
											)
										)
									}) to be able to proceed with your withdrawal.
								</div>

								: <WithdrawalForm inheritanceId={inheritance_id} setTxSent={setTxSent} />

						: <p>Todo3</p>

			}


		</div >
	);

}

export default InheritanceHeirPage;
