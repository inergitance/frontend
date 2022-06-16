import React, { useState, useRef } from "react";

import { IToken } from "../../scripts/walletConnector";

import "../../css/CreateInheritanceForm.css";

function TokensSelect(props: { tokens: IToken[], setToken: (token_id: string, decimals: number, amount: number) => void }) {

	const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(0);

	const tokenIDSelectElement = useRef<HTMLSelectElement>(null);
	const tokenAmountInputElement = useRef<HTMLInputElement>(null);

	if (props.tokens.length === 0) {
		return (<p>You don't have any tokens</p>);
	}

	function selectChangeHandler() {
		if (tokenIDSelectElement.current) {
			setSelectedTokenIndex(parseInt(tokenIDSelectElement.current.value));
		}
	}

	function addTokenHandler(e: React.MouseEvent<HTMLElement>) {
		e.preventDefault();
		if (tokenIDSelectElement.current && tokenAmountInputElement.current) {
			props.setToken(
				props.tokens[parseInt(tokenIDSelectElement.current.value)].id,
				props.tokens[parseInt(tokenIDSelectElement.current.value)].decimals,
				(parseFloat(tokenAmountInputElement.current.value) * (10 ** (props.tokens[selectedTokenIndex].decimals)))
			);
		}
	}

	return (
		<div>
			<select name="token-select" onChange={selectChangeHandler} ref={tokenIDSelectElement}>
				{props.tokens.map((token: IToken, index: number) => <option value={index} key={token.id}>{token.id}</option>)}
			</select>
			<p><b>Name:</b> {props.tokens[selectedTokenIndex].name}</p>
			<p><b>Description:</b> {props.tokens[selectedTokenIndex].description}</p>
			<p><b>Decimals:</b> {props.tokens[selectedTokenIndex].decimals}</p>
			<p><b>Available:</b>
				{props.tokens[selectedTokenIndex].amount * (10 ** (-props.tokens[selectedTokenIndex].decimals))}
			</p>
			<input type="number" name="token-amount" min="0"
				step={10 ** (-props.tokens[selectedTokenIndex].decimals)}
				max={props.tokens[selectedTokenIndex].amount * (10 ** (-props.tokens[selectedTokenIndex].decimals))}
				placeholder="token amount" ref={tokenAmountInputElement}
			/>
			<button onClick={addTokenHandler} className="create-inheritance-form-button">
				Add selected token
			</button>
		</div>
	);
}

export default TokensSelect;
