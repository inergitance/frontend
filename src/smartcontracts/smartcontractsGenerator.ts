import { compile_ergoscript_to_p2s } from "../scripts/smartcontractCompiler";

import { phase1_ergoscript, phase1_p2s_hardcoded_mainnet, phase1_p2s_hardcoded_testnet } from "./phase1";
import { phase2_ergoscript, phase2_p2s_hardcoded_mainnet, phase2_p2s_hardcoded_testnet } from "./phase2";
import { phase3_ergoscript, phase3_p2s_hardcoded_mainnet, phase3_p2s_hardcoded_testnet } from "./phase3";
import { ownerIndication_ergoscript } from "./ownerIndication";
import { heirIndication_ergoscript } from "./heirIndication";

import { get_request } from "../scripts/restApi";

import {
	USE_MAINNET, NODE_URL, NODE_ADDRESS_TO_TREE_PREFIX, USE_HARDCODED_P2S_ADDRESSES
} from "../scripts/blockchainParameters";

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

interface IAddressCacheIndicationIndex {
	[key: string]: string
}

interface IAddressCache {
	p1_p2s_addr: string | undefined,
	p2_p2s_addr: string | undefined,
	p3_p2s_addr: string | undefined,
	owner_indication: IAddressCacheIndicationIndex,
	heir_indication: IAddressCacheIndicationIndex
}

var address_cache: IAddressCache = {
	p1_p2s_addr: undefined,
	p2_p2s_addr: undefined,
	p3_p2s_addr: undefined,
	owner_indication: {},
	heir_indication: {}
};

export async function generate_phase1_p2s_address(): Promise<string> {

	if (USE_HARDCODED_P2S_ADDRESSES) {
		return USE_MAINNET ? phase1_p2s_hardcoded_mainnet : phase1_p2s_hardcoded_testnet;
	}

	if (typeof address_cache.p1_p2s_addr === "string") return address_cache.p1_p2s_addr;

	const phase2_tree_hash = await address_to_propBytes_hash_base64(
		(await generate_phase2_p2s_address())
	);

	address_cache.p1_p2s_addr = await compile_ergoscript_to_p2s(
		phase1_ergoscript.replaceAll("phase2_propBytes_hash_base64", phase2_tree_hash)
	);

	return address_cache.p1_p2s_addr;

}

export async function generate_phase2_p2s_address(): Promise<string> {

	if (USE_HARDCODED_P2S_ADDRESSES) {
		return USE_MAINNET ? phase2_p2s_hardcoded_mainnet : phase2_p2s_hardcoded_testnet;
	}

	if (typeof address_cache.p2_p2s_addr === "string") return address_cache.p2_p2s_addr;

	const phase3_tree_hash = await address_to_propBytes_hash_base64(
		(await generate_phase3_p2s_address())
	);

	address_cache.p2_p2s_addr = await compile_ergoscript_to_p2s(
		phase2_ergoscript.replaceAll("phase3_propBytes_hash_base64", phase3_tree_hash)
	);

	return address_cache.p2_p2s_addr;

}

export async function generate_phase3_p2s_address(): Promise<string> {

	if (USE_HARDCODED_P2S_ADDRESSES) {
		return USE_MAINNET ? phase3_p2s_hardcoded_mainnet : phase3_p2s_hardcoded_testnet;
	}

	if (typeof address_cache.p3_p2s_addr === "string") return address_cache.p3_p2s_addr;

	address_cache.p3_p2s_addr = await compile_ergoscript_to_p2s(phase3_ergoscript);

	return address_cache.p3_p2s_addr;
}

export async function generate_owners_indication_p2s_address(address: string): Promise<string> {

	if (address in address_cache.owner_indication) return address_cache.owner_indication[address];

	address_cache.owner_indication[address] = await compile_ergoscript_to_p2s(
		ownerIndication_ergoscript.replaceAll("owner_address", address)
	);

	return address_cache.owner_indication[address];
}

export async function generate_heir_indication_p2s_address(address: string): Promise<string> {

	if (address in address_cache.heir_indication) return address_cache.heir_indication[address];

	address_cache.heir_indication[address] = await compile_ergoscript_to_p2s(
		heirIndication_ergoscript.replaceAll("heir_address", address)
	);

	return address_cache.heir_indication[address];
}

export async function generate_phase1_p2s_propBytes_hash_hex(): Promise<string> {
	return address_to_propBytes_hash_hex(await generate_phase1_p2s_address());
}
