import React, { useState, useRef } from "react";

import { AppContext } from "../redux/AppContext";

import {
	MIN_NANO_ERGS_IN_BOX, NANO_ERGS_IN_ONE_ERG, TRANSACTION_PHASE1_BLOCKCHAIN_FEE,
	MAX_UNIQUE_TOKENS_IN_BOX
} from "../scripts/blockchainParameters";

import { INERGITANCE_SERVICE_FEE_AMOUNT } from "../scripts/inERGitanceSettings";

import { IWalletProperties, IUTXOToken } from "../scripts/walletConnector";

import {
	validate_address, create_transaction_phase1, sign_tx, submit_tx
} from "../scripts/transactionsBuilder";

import AssetsSelected from "./create_inheritance_form/AssetsSelected";
import TokensSelect from "./create_inheritance_form/TokensSelect";
import FeesOverview from "./create_inheritance_form/FeesOverview";
import Summary from "./create_inheritance_form/Summary";

import "../css/CreateInheritanceForm.css";

export interface ITokenSelected {
	id: string,
	amount: number,
	decimals: number
}

export interface IAssetsSelected {
	ergs: number;
	tokens: ITokenSelected[]
};

export interface IFees {
	blockchain: number,
	service: number
};

export interface IAddresses {
	owner: string,
	heir: string,
	holiday_protector: string,
}

export interface ICreateInheritanceProperties {
	assets: IAssetsSelected,
	addresses: IAddresses,
	weeks: number
};

export interface ITxSent {
	sent: boolean,
	txId: string
}

const ASSETS_SELECTED_DEFAULT_STATE: IAssetsSelected = {
	ergs: 0,
	tokens: []
};

const FEES_DEFAULT_STATE: IFees = {
	blockchain: TRANSACTION_PHASE1_BLOCKCHAIN_FEE + 2 * MIN_NANO_ERGS_IN_BOX,
	service: INERGITANCE_SERVICE_FEE_AMOUNT
};

const ADDRESSES_DEFAULT_STATE: IAddresses = {
	owner: "",
	heir: "",
	holiday_protector: ""
};

export const TX_SENT_DEFAULT_STATE: ITxSent = {
	sent: false,
	txId: ""
}

const BLAKE2B_256_ZEROS: string = "0000000000000000000000000000000000000000000000000000000000000000";

async function validate_form(
	settings: ICreateInheritanceProperties,
	fees: IFees,
	wallet: IWalletProperties
): Promise<boolean> {

	if ((settings.assets.ergs + fees.blockchain + fees.service) > wallet.balance.nanoErgs) {
		alert("Wallet don't have enough ERGs!");
		return false;
	}

	// minus one because one token place will be consumed by special newly
	// minted NFT used for inheritance identification
	if (settings.assets.tokens.length > (MAX_UNIQUE_TOKENS_IN_BOX - 1)) {
		alert(
			"You can only add maximum " +
			(MAX_UNIQUE_TOKENS_IN_BOX - 1).toString() +
			" tokens into your inheritance (blockchain limit)!"
		);
		return false;
	}

	if (settings.weeks < 1) {
		alert("At least one week withdrawal period is required!");
		return false;
	}

	const owner_valid = await validate_address(settings.addresses.owner);

	if (!owner_valid) {
		alert("Owner address is invalid!");
		return false;
	}

	const heir_valid = await validate_address(settings.addresses.heir);

	if (!heir_valid) {
		alert("Heir address is invalid!");
		return false;
	}

	const BLAKE2B_256_BASE16_CHARS_LENGTH: number = 64;

	function valid_hex_value(str: string): boolean {
		const n = str.length;
		for (let i = 0; i < n; ++i) {
			const ch = str[i];
			if ((ch < '0' || ch > '9') &&
				(ch < 'A' || ch > 'F') &&
				(ch < 'a' || ch > 'f')
			) {
				return false;
			}
		}
		return true;
	}

	if (
		settings.addresses.holiday_protector.length !== BLAKE2B_256_BASE16_CHARS_LENGTH ||
		(!valid_hex_value(settings.addresses.holiday_protector))
	) {
		alert("Invalid value for holiday protector's hash!");
		return false;
	}

	return true;
}

function CreateInheritanceForm() {

	// const { state, dispatch } = React.useContext(AppContext);
	const { state } = React.useContext(AppContext);

	const [assetsSelected, setAssetsSelected] = useState<IAssetsSelected>(ASSETS_SELECTED_DEFAULT_STATE);
	const [addresses, setAddresses] = useState<IAddresses>(ADDRESSES_DEFAULT_STATE);
	const [weeks, setWeeks] = useState<number>(1);

	const [txSent, setTxSent] = useState<ITxSent>(TX_SENT_DEFAULT_STATE);

	// const [fees, setFees] = useState<IFees>(FEES_DEFAULT_STATE);
	const [fees] = useState<IFees>(FEES_DEFAULT_STATE);

	const ergsAmountInputElement = useRef<HTMLInputElement>(null);
	const ownerAddressInputElement = useRef<HTMLInputElement>(null);
	const heirAddressInputElement = useRef<HTMLInputElement>(null);
	const holidayProtectorHashInputElement = useRef<HTMLInputElement>(null);

	const weeksInputElement = useRef<HTMLInputElement>(null);

	function assets_set_ergs(amount: number) {
		setAssetsSelected((previous: IAssetsSelected) => ({ ...previous, ergs: amount }));
	}

	function assets_set_token(token_id: string, decimals: number, amount: number) {

		setAssetsSelected((previous: IAssetsSelected) => {
			if (!previous.tokens.find((token: ITokenSelected) => (token.id === token_id))) {
				if (isNaN(amount) || amount <= 0) {
					return ({ ...previous });
				}
				return (
					{
						...previous, tokens: [...previous.tokens,
						{ id: token_id, amount: amount, decimals: decimals }
						]
					}
				);
			} else {
				const tmp_tkn: ITokenSelected | undefined =
					previous.tokens.find((token: ITokenSelected) => (token.id === token_id));
				if (tmp_tkn) tmp_tkn.amount = amount;
				if (amount <= 0) {
					return ({
						...previous,
						tokens: previous.tokens.filter((token: ITokenSelected) => (token.id !== token_id))
					});
				}
				return ({ ...previous });
			}

		});

	}

	function ergsAmountChangeHandler() {
		if (ergsAmountInputElement.current) {
			const nanoErgsValue = parseFloat(ergsAmountInputElement.current.value) * NANO_ERGS_IN_ONE_ERG;
			const maxNanoErgs = state.wallet.balance.nanoErgs - (fees.service + fees.blockchain);
			if (nanoErgsValue > maxNanoErgs) {
				ergsAmountInputElement.current.value = (maxNanoErgs / NANO_ERGS_IN_ONE_ERG).toString();
			}
		}
	}

	function addERGsHandler(e: React.MouseEvent<HTMLElement>) {
		e.preventDefault();
		if (ergsAmountInputElement.current) {
			const nanoErgsValue = parseFloat(ergsAmountInputElement.current.value) * NANO_ERGS_IN_ONE_ERG;
			const maxNanoErgs = state.wallet.balance.nanoErgs - (fees.service + fees.blockchain);
			assets_set_ergs(
				(nanoErgsValue > MIN_NANO_ERGS_IN_BOX) ?
					(nanoErgsValue > maxNanoErgs) ? maxNanoErgs : nanoErgsValue
					: MIN_NANO_ERGS_IN_BOX
			);
		}
	}

	function useCurrentAddressHandler(e: React.MouseEvent<HTMLElement>) {
		e.preventDefault();
		if (ownerAddressInputElement.current) {
			ownerAddressInputElement.current.value = state.wallet.address;
			addressesChangedHandler();
		}
	}

	function setZerosHandler(e: React.MouseEvent<HTMLElement>) {
		e.preventDefault();
		if (holidayProtectorHashInputElement.current) {
			holidayProtectorHashInputElement.current.value = BLAKE2B_256_ZEROS;
			addressesChangedHandler();
		}
	}

	function addressesChangedHandler() {
		setAddresses((previous: IAddresses) => (
			{
				...ADDRESSES_DEFAULT_STATE,
				owner:
					(ownerAddressInputElement.current ? ownerAddressInputElement.current.value : "None"),
				heir:
					(heirAddressInputElement.current ? heirAddressInputElement.current.value : "None"),
				holiday_protector:
					(holidayProtectorHashInputElement.current ? holidayProtectorHashInputElement.current.value : "None")
			}
		));
	}

	function weeksChangedHandler() {
		setWeeks((previous: number) => (
			(weeksInputElement.current ? parseInt(weeksInputElement.current.value) : 1)
		));
	}

	function createInheritanceButtonHandler(e: React.MouseEvent<HTMLElement>) {
		e.preventDefault();
		validate_form(
			{
				assets: assetsSelected,
				addresses: addresses,
				weeks: weeks
			},
			fees,
			state.wallet
		).then((result: boolean) => {
			if (result){
				const tkns: IUTXOToken[] = assetsSelected.tokens.map((tkn: ITokenSelected) => (
					{
						tokenId: tkn.id,
						amount: tkn.amount.toString()
					}
				));
				create_transaction_phase1(
					addresses.owner,
					addresses.heir,
					weeks,
					assetsSelected.ergs,
					tkns
				).then(u_tx => {
					sign_tx(u_tx).then(s_tx => {
						if(s_tx !== null){
							submit_tx(s_tx).then(res => {
								if(res !== null){
									setTxSent({sent: true, txId: res});
								}
							});
						}
					});
				});
			}
		});
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
		<div className="inheritance-form-main-div">
			<h2 className="inheritance-form-heading">Create inheritance form:</h2>
			<hr />
			<form action="">
				<div className="inheritance-form-subsection-div">
					<h3 className="inheritance-form-heading">Assets to include:</h3>
					<hr />
					<AssetsSelected assets={assetsSelected} />
					<input type="number" name="ergs-amount" min={MIN_NANO_ERGS_IN_BOX / NANO_ERGS_IN_ONE_ERG}
						max={state.wallet.balance.nanoErgs / NANO_ERGS_IN_ONE_ERG} step="0.01"
						onChange={ergsAmountChangeHandler}
						placeholder="ERG amount" ref={ergsAmountInputElement}
					/>
					<button onClick={addERGsHandler} className="create-inheritance-form-button">
						Add ERGs
					</button>

					<div>
						<h3>Add tokens to inheritance:</h3>
						<TokensSelect tokens={state.wallet.balance.tokens} setToken={assets_set_token} />
					</div>
				</div>
				<div className="inheritance-form-subsection-div">
					<h3 className="inheritance-form-heading">Inheritance settings:</h3>
					<hr />
					<input type="text" placeholder="Owner's address (yours)"
						onChange={addressesChangedHandler} ref={ownerAddressInputElement}
					/>
					<button onClick={useCurrentAddressHandler} className="create-inheritance-form-button">
						Use current address
					</button>
					<input type="text" placeholder="Heir's address"
						onChange={addressesChangedHandler} ref={heirAddressInputElement}
					/>
					<input type="text" placeholder="Holiday protector address"
						onChange={addressesChangedHandler} ref={holidayProtectorHashInputElement}
					/>
					<button onClick={setZerosHandler} className="create-inheritance-form-button">
						Set zeros
					</button>
					<input type="number" min="1" placeholder="Withdrawal delay (weeks)"
						onChange={weeksChangedHandler} ref={weeksInputElement}
					/>
				</div>
				<div className="inheritance-form-subsection-div">
					<h3 className="inheritance-form-heading">Summary:</h3>
					<hr />
					<Summary
						properties={{
							assets: assetsSelected,
							addresses: addresses,
							weeks: weeks
						}}
					/>
					<hr />
					<h3 className="inheritance-form-heading">Fees:</h3>
					<hr />
					<FeesOverview fees={fees} />
				</div>
				<button onClick={createInheritanceButtonHandler} className="create-inheritance-form-button">
					Create inheritance
				</button>
			</form>
		</div>
	);
}

export default CreateInheritanceForm;
