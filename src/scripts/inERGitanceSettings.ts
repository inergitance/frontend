import { USE_MAINNET } from "./blockchainParameters";

export const INERGITANCE_SERVICE_FEE_AMOUNT: number = 10000000;

export const MAINNET_SERVICE_FEE_ADDRESS: string = "todo";
export const TESTNET_SERVICE_FEE_ADDRESS: string = "3WwXjy6WHJM4DXRvkn4gZcWuC5wLYimikxKeuKnkEEsCBx3JSegy";

export const INERGITANCE_SERVICE_FEE_ADDRESS: string =
	(USE_MAINNET) ? MAINNET_SERVICE_FEE_ADDRESS : TESTNET_SERVICE_FEE_ADDRESS;
