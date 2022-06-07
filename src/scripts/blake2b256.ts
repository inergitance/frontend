import { blake2bFinal, blake2bInit, blake2bUpdate } from 'blakejs';

export function blake2b256(data: Uint8Array): Uint8Array {
	
	const KEY = null;
	//use 256bits variant of Blake2b
	const OUTPUT_LENGTH = 32;
	const ctx = blake2bInit(OUTPUT_LENGTH, KEY || undefined);

	blake2bUpdate(ctx, data);

	return blake2bFinal(ctx);

}

export function blake2b256_hexdigest(data: Uint8Array): string{
	return Buffer.from(blake2b256(data)).toString("hex");
}

export function blake2b256_base64digest(data: Uint8Array): string{
	return Buffer.from(blake2b256(data)).toString("base64");
}
