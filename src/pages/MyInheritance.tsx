import React, { useState } from "react";
import { Link } from "react-router-dom";

import { ICurrentInheritances, CURRENT_INHERITANCES_DEFAULT_STATE } from "../components/CurrentInheritancesOverview";
import { get_users_inheritances } from "../scripts/walletConnector";

import { Navigate } from "react-router-dom";

import CurrentInheritancesOverview from "../components/CurrentInheritancesOverview";

import { AppContext } from "../redux/AppContext";

import "../css/MyInheritance.css";

function MyInheritancePage() {

	const { state, dispatch } = React.useContext(AppContext);
	const [currentInheritances, setCurrentInheritances] = useState<ICurrentInheritances>(CURRENT_INHERITANCES_DEFAULT_STATE);

	if (!state.wallet.connected) {
		return <Navigate to="/" />
	}

	//always reload inheritances instead of relaying on the old loaded ones in the redux AppContext state
	if (!currentInheritances.loaded) {
		get_users_inheritances(state.wallet.address).then((result: ICurrentInheritances) => {
			dispatch({ type: "inheritances_set", payload: result });
			setCurrentInheritances(result);
		});
	}

	return (
		<div>
			<div>
				{
					currentInheritances.loaded ?
						<CurrentInheritancesOverview /> :
						<h2>Loading your's inheritances....</h2>
				}
			</div>
			<Link to="/create-inheritance">
				<button className="create-inheritance-button">Create inheritance</button>
			</Link>
		</div>
	);

}

export default MyInheritancePage;
