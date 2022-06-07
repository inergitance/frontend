import { compile_ergoscript_to_p2s } from "../scripts/smartcontractCompiler";

import { phase1_ergoscript } from "./phase1";
import { phase2_ergoscript } from "./phase2";
import { phase3_ergoscript } from "./phase3";
import { ownerIndication_ergoscript } from "./ownerIndication";
import { heirIndication_ergoscript } from "./heirIndication";

import { get_request } from "../scripts/restApi";
import { NODE_URL, NODE_ADDRESS_TO_TREE_PREFIX } from "../scripts/blockchainParameters";

import { blake2b256_base64digest, blake2b256_hexdigest } from "../scripts/blake2b256";

async function address_to_propBytes(addr: string): Promise<Uint8Array> {

	const tree_response = await get_request(
		NODE_URL + NODE_ADDRESS_TO_TREE_PREFIX + addr
	);

	return Uint8Array.from(
		Buffer.from(tree_response.tree, "hex")
	);

}

async function address_to_propBytes_hash_base64(addr: string): Promise<string> {
	return blake2b256_base64digest(await address_to_propBytes(addr));
}

async function address_to_propBytes_hash_hex(addr: string): Promise<string> {
	return blake2b256_hexdigest(await address_to_propBytes(addr));
}

export async function generate_phase1_p2s_address(): Promise<string> {

	const phase2_tree_hash = await address_to_propBytes_hash_base64(
		(await generate_phase2_p2s_address())
	);

	return compile_ergoscript_to_p2s(
		phase1_ergoscript.replaceAll("phase2_propBytes_hash_base64", phase2_tree_hash)
	);

}

export async function generate_phase2_p2s_address(): Promise<string> {

	const phase3_tree_hash = await address_to_propBytes_hash_base64(
		(await generate_phase3_p2s_address())
	);

	return compile_ergoscript_to_p2s(
		phase2_ergoscript.replaceAll("phase3_propBytes_hash_base64", phase3_tree_hash)
	);

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

export async function generate_phase1_p2s_propBytes_hash_hex(): Promise<string> {
	return address_to_propBytes_hash_hex(await generate_phase1_p2s_address());
}
