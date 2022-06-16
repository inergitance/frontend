import React from "react";

import { Link } from "react-router-dom";

import { INFTBox } from "../scripts/walletConnector";

import "../css/CurrentInheritancesOverviewTable.css";

function get_state_name_from_phase(phase: number): string {
	if (phase === 1) return "Exist";
	if (phase === 2) return "Pending withdrawal by heir";
	if (phase === 3) return "Heir's Withdrawal returned by holiday protector";
	return "Unknown";
}

function CurrentInheritancesOverviewTable(props: { owner: boolean, value: INFTBox[] }) {

	if (props.value.length === 0) {
		return (<div>
			Sorry you are not {props.owner ? "owner" : "heir"} of any inheritances!
		</div>);
	}

	return (
		<table className="inheritances-overview-table">
			<thead>
				<tr>
					<th>Inheritance ID</th>
					<th>Inheritance state</th>
				</tr>
			</thead>
			<tbody>
				{
					props.value.map((box: INFTBox) =>
						<tr key={box.nftId}>
							<td>
								<Link to={
									"/inheritances/" +
									(props.owner ? "owner" : "heir") +
									"?id=" +
									box.nftId
								}>
									{box.nftId}
								</Link>
							</td>
							<td>{get_state_name_from_phase(box.phase)}</td>
						</tr>
					)
				}
			</tbody>
		</table>
	);
}

export default CurrentInheritancesOverviewTable;
