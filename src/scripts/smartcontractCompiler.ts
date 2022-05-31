import { NODE_URL, NODE_COMPILE_P2S_ENDPOINT_PREFIX } from "./blockchainParameters";
import { post_request } from "./restApi";

export async function compile_ergoscript_to_p2s(script: string): Promise<string> {

	const data = JSON.stringify({ source: script });

	const result = await post_request(NODE_URL + NODE_COMPILE_P2S_ENDPOINT_PREFIX, data);

	return result.address;
}
