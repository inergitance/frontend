import React from "react";

import {
	generate_owners_indication_p2s_address, generate_heir_indication_p2s_address,
	generate_phase1_p2s_address, generate_phase2_p2s_address, generate_phase3_p2s_address
} from "../smartcontracts/smartcontractsGenerator";

import { useState } from "react";
import { AppContext } from "../redux/AppContext";

import { test_it } from "../scripts/transactionsBuilder";

import "../css/About.css";

function AboutPage() {

	const { state } = React.useContext(AppContext);

	const [owner, setOwner] = useState<string>("lol");
	const [heir, setHeir] = useState<string>("lol");
	const [p1Addr, setP1Addr] = useState<string>("lol");
	const [p2Addr, setP2Addr] = useState<string>("lol");
	const [p3Addr, setP3Addr] = useState<string>("lol");

	if (state.wallet.connected) {

		generate_owners_indication_p2s_address(state.wallet.address).then(result => {
			setOwner(result);
		});

		generate_heir_indication_p2s_address(state.wallet.address).then(result => {
			setHeir(result);
		});

		generate_phase1_p2s_address().then(result => {
			setP1Addr(result);
		});

		generate_phase2_p2s_address().then(result => {
			setP2Addr(result);
		});

		generate_phase3_p2s_address().then(result => {
			setP3Addr(result);
		});

	}

	function buttonClickHandler() {
		test_it();
	}


	return (
		<div>
			<div className="about-page-text">
				<h1>About</h1>
				<p>
					InERGitance is a decentralized inheritance solution developed specifically for Ergo blockchain. Main motivation of the project is to give back freedom and full control over their funds to its' users.
				</p>
				<p>
					Unfortunately, in many countries freedom of people (especially financial freedom) is heavily restricted by various forms of abusive laws. One of the main purposes of cryptocurrencies is to bring back freedom to anyone who desires it. Typically, even if some "better" goverments don't impose heavy constraints on financial freedom of a living person, they still heavily regulate what will happen with one's property after he dies.
				</p>
				<p>
					More often than not there are no options for deceased to freely express what they wish to happen with their belongings after their death. There can be, for example, restrictions to pass their belongings only to family members, etc., and even if they don't like it, they simply cannot refuse doing so. Therefore, the purpose of this project is to help those affected people to fully regain their financial freedom.
				</p>
			</div>
			<p>OwnerIndication</p>
			<p>{owner}</p>
			<p>HeirIndication</p>
			<p>{heir}</p>
			<p>P1Addr</p>
			<p>{p1Addr}</p>
			<p>P2Addr</p>
			<p>{p2Addr}</p>
			<p>P3Addr</p>
			<p>{p3Addr}</p>
			<button onClick={buttonClickHandler}>Sign TX</button>
		</div>
	);

}

export default AboutPage;
