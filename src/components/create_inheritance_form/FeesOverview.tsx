import React from "react";

import { IFees } from "../CreateInheritanceForm";

import { NANO_ERGS_IN_ONE_ERG } from "../../scripts/blockchainParameters";

function FeesOverview(props: { fees: IFees }) {

	return (
		<table className="fees-overview-table">
			<thead>
				<tr>
					<th>Type</th>
					<th>Amount</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>Ergo blockchain fee</td>
					<td>{props.fees.blockchain / NANO_ERGS_IN_ONE_ERG} ERG</td>
				</tr>
				<tr>
					<td>Service fee</td>
					<td>{props.fees.service / NANO_ERGS_IN_ONE_ERG} ERG</td>
				</tr>
				<tr>
					<td><b>Total</b></td>
					<td><b>{(props.fees.blockchain + props.fees.service) / NANO_ERGS_IN_ONE_ERG} ERG</b></td>
				</tr>
			</tbody>
		</table>
	);

}

export default FeesOverview;
