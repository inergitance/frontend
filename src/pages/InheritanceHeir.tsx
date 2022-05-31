import React, { useEffect } from "react";

import { Navigate, useSearchParams } from "react-router-dom";

import { get_box_containing_nft } from "../scripts/walletConnector";

import { AppContext } from "../redux/AppContext";

function InheritanceHeirPage() {

	const { state } = React.useContext(AppContext);

	const [searchParams] = useSearchParams();

	const inheritance_id = searchParams.get("id");
	
	useEffect(() => {
		if(inheritance_id !== null)
			get_box_containing_nft(inheritance_id).then(result => {
				if(result === null)
					return (<Navigate to="/my-inheritance" />);
			});
	});

	if (!state.wallet.connected || !state.inheritances.loaded) {
		return <Navigate to="/" />
	}

	if (inheritance_id === null || inheritance_id === "") {
		return <Navigate to="/" />
	}

	return (
		<div>(HEIR page) {inheritance_id}</div>
	);

}

export default InheritanceHeirPage;
