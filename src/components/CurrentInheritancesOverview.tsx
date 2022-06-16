import React from "react";

import { INFTBox } from "../scripts/walletConnector";

import { AppContext } from "../redux/AppContext";

import CurrentInheritancesOverviewTable from "./CurrentInheritancesOverviewTable";

export interface ICurrentInheritances {
	loaded: boolean,
	owner_of: INFTBox[],
	heir_of: INFTBox[]
};

export const CURRENT_INHERITANCES_DEFAULT_STATE: ICurrentInheritances = {
	loaded: false,
	owner_of: [],
	heir_of: []
};

function CurrentInheritancesOverview() {

	const { state } = React.useContext(AppContext);

	return (
		<div>
			{
				state.inheritances.loaded ?
					(state.inheritances.owner_of.length === 0 && state.inheritances.heir_of.length === 0) ?
						<div>Sorry, you are not owner nor heir of any inheritances :-)</div>
						:
						<div>
							<h2>Owner of:</h2>
							<CurrentInheritancesOverviewTable owner={true} value={state.inheritances.owner_of} />
							<h2>Heir of:</h2>
							<CurrentInheritancesOverviewTable owner={false} value={state.inheritances.heir_of} />
						</div>
					: []
			}
		</div>
	);
}

export default CurrentInheritancesOverview;
