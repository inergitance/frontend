import React from "react";

import { ITokenSelected, IAssetsSelected } from "../CreateInheritanceForm";

import { NANO_ERGS_IN_ONE_ERG } from "../../scripts/blockchainParameters";

function AssetsSelected(props: { assets: IAssetsSelected }) {

	return (
		<table className="assets-selected-table">
			<thead>
				<tr>
					<th>Name</th>
					<th>Amount</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>ERG</td>
					<td>{props.assets.ergs / NANO_ERGS_IN_ONE_ERG}</td>
				</tr>
				{(props.assets.tokens.length === 0) ? [] :
					props.assets.tokens.map((token: ITokenSelected) =>
						<tr key={token.id}>
							<td>{token.id}</td>
							<td>{(token.amount * (10 ** (-token.decimals))).toFixed(token.decimals)}</td>
						</tr>
					)
				}
			</tbody>
		</table>
	);
}

export default AssetsSelected;
