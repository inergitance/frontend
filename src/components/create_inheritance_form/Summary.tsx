import React from "react";

// import { ITokenSelected, IAssetsSelected, ICreateInheritanceProperties } from "../CreateInheritanceForm";
import { ITokenSelected, ICreateInheritanceProperties } from "../CreateInheritanceForm";

import { NANO_ERGS_IN_ONE_ERG } from "../../scripts/blockchainParameters";

function Summary(props: { properties: ICreateInheritanceProperties }) {
	return (
		<table className="create-inheritance-summary-table">
			<tbody>
				<tr>
					<th colSpan={2}>Assets</th>
				</tr>
				<tr>
					<th>Name</th>
					<th>Amount</th>
				</tr>
				<tr>
					<td>ERG</td>
					<td>{props.properties.assets.ergs / NANO_ERGS_IN_ONE_ERG}</td>
				</tr>
				{(props.properties.assets.tokens.length === 0) ? [] :
					props.properties.assets.tokens.map((token: ITokenSelected) =>
						<tr key={token.id}>
							<td>{token.id}</td>
							<td>{(token.amount * (10 ** (-token.decimals))).toFixed(token.decimals)}</td>
						</tr>
					)
				}
				<tr>
					<th colSpan={2}>Addresses</th>
				</tr>
				<tr>
					<th>Role</th>
					<th>Address</th>
				</tr>
				<tr>
					<td>Owner</td>
					<td>{props.properties.addresses.owner}</td>
				</tr>
				<tr>
					<td>Heir</td>
					<td>{props.properties.addresses.heir}</td>
				</tr>
				<tr>
					<th>Role</th>
					<th>Hash</th>
				</tr>
				<tr>
					<td>Holiday protector</td>
					<td>{props.properties.addresses.holiday_protector}</td>
				</tr>
				<tr>
					<th colSpan={2}>Heir's withdrawal period</th>
				</tr>
				<tr>
					<td colSpan={2}>{props.properties.weeks} {(props.properties.weeks > 1) ? "weeks" : "week"}</td>
				</tr>
			</tbody>
		</table>
	);
}

export default Summary;
