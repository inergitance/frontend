import { compile_ergoscript_to_p2s } from "../scripts/smartcontractCompiler";

import { phase1_ergoscript } from "./phase1";
import { phase2_ergoscript } from "./phase2";
import { phase3_ergoscript } from "./phase3";
import { ownerIndication_ergoscript } from "./ownerIndication";
import { heirIndication_ergoscript } from "./heirIndication";

export async function generate_phase1_p2s_address(): Promise<string> {
	return compile_ergoscript_to_p2s(phase1_ergoscript);
}

export async function generate_phase2_p2s_address(): Promise<string> {
	return compile_ergoscript_to_p2s(phase2_ergoscript);
}

export async function generate_phase3_p2s_address(): Promise<string> {
	return compile_ergoscript_to_p2s(phase3_ergoscript);
}

export async function generate_owners_indication_p2s_address(address: string): Promise<string> {
	return compile_ergoscript_to_p2s(ownerIndication_ergoscript.replaceAll("owner_address", address));
}

export async function generate_heir_indication_p2s_address(address: string): Promise<string> {
	return compile_ergoscript_to_p2s(heirIndication_ergoscript.replaceAll("heir_address", address));
}
