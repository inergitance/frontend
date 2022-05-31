import React from "react";

import { Navigate } from "react-router-dom";

import { AppContext } from "../redux/AppContext";

import CreateInheritanceForm from "../components/CreateInheritanceForm";

function CreateInheritancePage() {

	// const { state, dispatch } = React.useContext(AppContext);
	const { state } = React.useContext(AppContext);

	if (!state.wallet.connected) {
		return <Navigate to="/" />
	}

	return (
		<div>
			<CreateInheritanceForm />
		</div>
	);

}

export default CreateInheritancePage;
