import { IWalletProperties, WALLET_DEFAULT_STATE } from "../scripts/walletConnector";
import {
	ICurrentInheritances, CURRENT_INHERITANCES_DEFAULT_STATE
} from "../components/CurrentInheritancesOverview";

export interface IState {
	wallet: IWalletProperties;
	inheritances: ICurrentInheritances;
}

export interface IAction {
	type: string;
	payload: any;
}

export const initialState = {
	wallet: WALLET_DEFAULT_STATE,
	inheritances: CURRENT_INHERITANCES_DEFAULT_STATE
}

export function reducer(state: IState, action: IAction) {

	switch (action.type) {

		case "wallet_set_connected":
			return { ...state, wallet: { ...state.wallet, connected: action.payload } };

		case "wallet_set_address":
			return { ...state, wallet: { ...state.wallet, address: action.payload } };

		case "wallet_set_balance":
			return { ...state, wallet: { ...state.wallet, balance: action.payload } };

		case "wallet_reset":
			return { ...state, wallet: WALLET_DEFAULT_STATE, inheritances: CURRENT_INHERITANCES_DEFAULT_STATE };

		case "inheritances_set":
			return { ...state, inheritances: action.payload };

		default:
			return state;
	}

}
