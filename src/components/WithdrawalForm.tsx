import React, { useRef } from "react";

import {
	get_box_containing_nft, get_box_to_spend, INFTBox, IUTXOToken
} from "../scripts/walletConnector";

import {
	validate_address, create_withdrawal_transaction, sign_tx, submit_tx, INautilusUTXO
} from "../scripts/transactionsBuilder";

import { AppContext } from "../redux/AppContext";

import { ITxSent } from "../components/CreateInheritanceForm";

import "../css/CreateInheritanceForm.css";

async function construct_and_sign_withdrawal_transaction(box: INFTBox, address: string): Promise<string | null> {

	const bx: INautilusUTXO = await get_box_to_spend(box.boxId);
	const tkns: IUTXOToken[] = bx.assets;

	const unsigned_tx = await create_withdrawal_transaction(
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

function WithdrawalForm(
	props: {
		inheritanceId: string,
		setTxSent: React.Dispatch<React.SetStateAction<ITxSent>>
	}
) {

	const { state } = React.useContext(AppContext);

	const withdrawalAddressInputElement = useRef<HTMLInputElement>(null);

	function addressChangedHandler() {

	}

	function useCurrentAddressHandler(e: React.MouseEvent<HTMLElement>) {
		e.preventDefault();
		if (withdrawalAddressInputElement.current) {
			withdrawalAddressInputElement.current.value = state.wallet.address;
			addressChangedHandler();
		}
	}

	function withdrawAssetsHandler(e: React.MouseEvent<HTMLElement>) {
		e.preventDefault();
		if (withdrawalAddressInputElement.current) {
			validate_address(withdrawalAddressInputElement.current.value).then((result: boolean) => {
				if (result && props.inheritanceId !== null) {
					get_box_containing_nft(props.inheritanceId).then(result => {
						if (result !== null) {
							construct_and_sign_withdrawal_transaction(result,
								withdrawalAddressInputElement.current!.value
							).then(res => {
								if (res == null) alert("Transaction sending failed!");
								else {
									props.setTxSent({ sent: true, txId: res });
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

	return (

		<div className="inheritance-form-main-div">
			<h2 className="inheritance-form-heading">Inheritance withdrawal form</h2>
			<form action="">

				<div className="inheritance-form-subsection-div">
					<h3 className="inheritance-form-heading">Address:</h3>
					<hr />
					<input type="text" placeholder="Withdrawal address"
						onChange={addressChangedHandler} ref={withdrawalAddressInputElement}
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

	);

}

export default WithdrawalForm;
