import { get_request } from "./restApi";
import {
	EXPLORER_URL, EXPLORER_BLOKCHAIN_HEIGHT_PREFIX, MIN_NANO_ERGS_IN_BOX, TRANSACTION_PHASE1_BLOCKCHAIN_FEE,
	USE_MAINNET, TRANSACTION_OWNER_WITHDRAWAL_BLOCKCHAIN_FEE, ADDRESS_NETWORK_TYPE_CURRENT,
	TRANSACTION_PHASE1_TO_PHASE2_BLOCKCHAIN_FEE
} from "./blockchainParameters";
import { INERGITANCE_SERVICE_FEE_ADDRESS, INERGITANCE_SERVICE_FEE_AMOUNT } from "../scripts/inERGitanceSettings";
import { IUTXOToken, get_box_to_spend_original_json } from "./walletConnector";

import {
	generate_phase1_p2s_address,
	generate_owners_indication_p2s_address,
	generate_heir_indication_p2s_address,
	generate_phase2_p2s_address,
	generate_phase1_p2s_propBytes_hash_hex
} from "../smartcontracts/smartcontractsGenerator";

let ergolib = import("ergo-lib-wasm-browser");

declare const ergoConnector: {
	nautilus: {
		connect(settings: { createErgoObject: boolean } | undefined): Promise<boolean>;
		isConnected(): Promise<boolean>;
		disconnect(): Promise<boolean>;
		getContext(): Promise<object>;
	};
};

interface ITxInput {
	boxId: string,
	extension: any
}

interface ITxOutputAsset {
	tokenId: string,
	amount: number
}

interface ITxOutputAssetConverted {
	tokenId: string,
	amount: string
}

interface ITxOutput {
	value: number,
	ergoTree: string,
	assets: ITxOutputAsset[],
	additionalRegisters: any,
	creationHeight: number
}

interface ITxOutputConverted {
	value: string,
	ergoTree: string,
	assets: ITxOutputAssetConverted[],
	additionalRegisters: any,
	creationHeight: number
}

interface ITx {
	inputs: ITxInput[],
	dataInputs: any[],
	outputs: ITxOutput[]
}

interface ITxConverted {
	inputs: ITxInput[],
	dataInputs: any[],
	outputs: ITxOutputConverted[]
}

interface ISignedTxInput {
	boxId: string,
	spendingProof: {
		proofBytes: string,
		extension: any
	}
}

interface ISignedOutput {
	boxId: string,
	value: number,
	ergoTree: string,
	assets: ITxOutputAsset[],
	additionalRegisters: any,
	creationHeight: number,
	transactionId: string,
	index: number
}

interface ISignedTx {
	id: string,
	inputs: ISignedTxInput[]
	dataInputs: any[],
	outputs: ISignedOutput[]
}

export function convert_tx_values_number_to_string(tx: ITx): ITxConverted {
	return {
		...tx, outputs: tx.outputs.map(
			(output: ITxOutput) => convert_utxo_values_number_to_string(output))
	};
}

export function convert_utxo_values_number_to_string(json: ITxOutput): ITxOutputConverted {
	if (json.assets == null) {
		json.assets = [];
	}
	return {
		...json,
		value: json.value.toString(),

		assets: json.assets.map((asset: ITxOutputAsset) => ({
			tokenId: asset.tokenId,
			amount: asset.amount.toString(),
		})),
	};
}

export async function validate_address(address: string): Promise<boolean> {

	let wasm = (await ergolib);

	try {
		if (USE_MAINNET) {
			wasm.Address.from_mainnet_str(address);
		} else {
			wasm.Address.from_testnet_str(address);
		}
	} catch (_) { return false; }

	return true;
}

async function get_block_height(): Promise<number> {
	const response = await get_request(EXPLORER_URL + EXPLORER_BLOKCHAIN_HEIGHT_PREFIX);
	return response.items[0].height;
}

export interface INautilusUTXOAsset {
	tokenId: string,
	amount: string
}

export interface INautilusUTXO {
	boxId: string,
	transactionId: string,
	index: number,
	ergoTree: string,
	creationHeight: number,
	value: string,
	assets: INautilusUTXOAsset[]
	additionalRegisters: any,
	confirmed: boolean
}

async function get_utxos() {
	const ctx: any = await ergoConnector.nautilus.getContext();
	const utxos: INautilusUTXO[] = await ctx.get_utxos();
	return utxos;
}

async function get_box_selection(utxos: any[], nanoErgs: number, tokens: IUTXOToken[]) {

	let wasm = (await ergolib);

	let wasm_tokens = new wasm.Tokens();
	tokens.forEach((token: IUTXOToken) => {
		wasm_tokens.add(
			new wasm.Token(
				wasm.TokenId.from_str(token.tokenId),
				wasm.TokenAmount.from_i64(wasm.I64.from_str(token.amount))
			)
		);
	});

	const selector = new wasm.SimpleBoxSelector();

	return selector.select(
		wasm.ErgoBoxes.from_boxes_json(utxos),
		wasm.BoxValue.from_i64(wasm.I64.from_str(nanoErgs.toString())),
		wasm_tokens
	);

}

async function get_output_box_candidates_phase1(
	owner: string, heir: string, hpHash: string, lockTime: number, nanoErgs: number, tokens: IUTXOToken[],
	nftId: string, height: number
) {

	let wasm = (await ergolib);

	const phase1_address = await generate_phase1_p2s_address();
	const owner_indication_address = await generate_owners_indication_p2s_address(owner);
	const heir_indication_address = await generate_heir_indication_p2s_address(heir);

	const min_erg_value = wasm.BoxValue.from_i64(wasm.I64.from_str((MIN_NANO_ERGS_IN_BOX).toString()));
	const service_fee_value = wasm.BoxValue.from_i64(wasm.I64.from_str((INERGITANCE_SERVICE_FEE_AMOUNT).toString()));
	const inheritance_erg_value = wasm.BoxValue.from_i64(wasm.I64.from_str(nanoErgs.toString()));

	const output_box_candidates = wasm.ErgoBoxCandidates.empty();

	const first_output_builder = new wasm.ErgoBoxCandidateBuilder(
		inheritance_erg_value,
		wasm.Contract.pay_to_address(wasm.Address.from_base58(phase1_address)),
		height
	);

	const second_output_builder = new wasm.ErgoBoxCandidateBuilder(
		min_erg_value,
		wasm.Contract.pay_to_address(wasm.Address.from_base58(owner_indication_address)),
		height
	);

	const third_output_builder = new wasm.ErgoBoxCandidateBuilder(
		min_erg_value,
		wasm.Contract.pay_to_address(wasm.Address.from_base58(heir_indication_address)),
		height
	);

	const fourth_output_builder = new wasm.ErgoBoxCandidateBuilder(
		service_fee_value,
		wasm.Contract.pay_to_address(wasm.Address.from_base58(INERGITANCE_SERVICE_FEE_ADDRESS)),
		height
	);

	tokens.forEach((token: IUTXOToken) => {
		first_output_builder.add_token(
			wasm.TokenId.from_str(token.tokenId),
			wasm.TokenAmount.from_i64(wasm.I64.from_str(token.amount))
		);
	});

	first_output_builder.add_token(
		wasm.TokenId.from_str(nftId),
		wasm.TokenAmount.from_i64(wasm.I64.from_str("1"))
	);

	//first_output - R4[SigmaProp]
	const ownerSigmaProp = wasm.Constant.from_ecpoint_bytes(
		wasm.Address.from_base58(owner).to_bytes(ADDRESS_NETWORK_TYPE_CURRENT).subarray(1, 34)
	);

	//first_output - R5[SigmaProp]
	const heirSigmaProp = wasm.Constant.from_ecpoint_bytes(//_group_element(
		wasm.Address.from_base58(heir).to_bytes(ADDRESS_NETWORK_TYPE_CURRENT).subarray(1, 34)
	);

	//first_output - R6[Coll[Byte]]
	const holidayProtectorHashValue = wasm.Constant.from_byte_array(
		Uint8Array.from(Buffer.from(hpHash, "hex"))
	);

	//first_output - R7[Int]
	const lockTimeValue = wasm.Constant.from_i32(lockTime);

	//first_output - R8[Coll[Byte]]
	const nftIdValue = wasm.Constant.from_byte_array(
		Uint8Array.from(Buffer.from(nftId, "hex"))
	);

	//first_output - R9[Coll[Byte]]
	const phase1PropBytes = wasm.Constant.from_byte_array(
		Uint8Array.from(Buffer.from((await generate_phase1_p2s_propBytes_hash_hex()), "hex"))
	);

	first_output_builder.set_register_value(4, ownerSigmaProp);
	first_output_builder.set_register_value(5, heirSigmaProp);
	first_output_builder.set_register_value(6, holidayProtectorHashValue);
	first_output_builder.set_register_value(7, lockTimeValue);
	first_output_builder.set_register_value(8, nftIdValue);
	first_output_builder.set_register_value(9, phase1PropBytes);

	output_box_candidates.add(first_output_builder.build());
	output_box_candidates.add(second_output_builder.build());
	output_box_candidates.add(third_output_builder.build());
	output_box_candidates.add(fourth_output_builder.build());

	return output_box_candidates;
}

async function get_output_box_candidates_owner_withdrawal(
	owner: string, nanoErgs: number, tokens: IUTXOToken[], nftId: string, height: number
) {

	let wasm = (await ergolib);

	const inheritance_erg_value = wasm.BoxValue.from_i64(
		wasm.I64.from_str(
			(nanoErgs - TRANSACTION_OWNER_WITHDRAWAL_BLOCKCHAIN_FEE).toString()
		)
	);

	const output_box_candidates = wasm.ErgoBoxCandidates.empty();

	const first_output_builder = new wasm.ErgoBoxCandidateBuilder(
		inheritance_erg_value,
		wasm.Contract.pay_to_address(wasm.Address.from_base58(owner)),
		height
	);

	tokens.forEach((token: IUTXOToken) => {
		if (token.tokenId !== nftId)
			first_output_builder.add_token(
				wasm.TokenId.from_str(token.tokenId),
				wasm.TokenAmount.from_i64(wasm.I64.from_str(token.amount))
			);
	});

	const dummyValue = wasm.Constant.from_byte_array(
		Uint8Array.from(Buffer.from("225bf0eae4ae254b52da3dc4d2551575739a8b4ce9aceb059771426bbb292c98", "hex"))
	);

	const ownerSigmaProp = wasm.Constant.from_ecpoint_bytes(
		wasm.Address.from_base58(owner).to_bytes(ADDRESS_NETWORK_TYPE_CURRENT).subarray(1, 34)
	);

	const lockTimeValue = wasm.Constant.from_i32(9);

	first_output_builder.set_register_value(4, ownerSigmaProp);
	first_output_builder.set_register_value(5, ownerSigmaProp);
	first_output_builder.set_register_value(6, dummyValue);
	first_output_builder.set_register_value(7, lockTimeValue);
	first_output_builder.set_register_value(8, dummyValue);
	first_output_builder.set_register_value(9, dummyValue);

	output_box_candidates.add(first_output_builder.build());

	return output_box_candidates;
}

async function get_output_box_candidates_phase1_to_phase2(
	heir: string, nanoErgs: number, tokens: IUTXOToken[], box_to_spend_json: string,
	nftId: string, height: number
) {

	let wasm = (await ergolib);

	const phase2_address = await generate_phase2_p2s_address();

	const inheritance_erg_value = wasm.BoxValue.from_i64(
		wasm.I64.from_str(
			(nanoErgs - TRANSACTION_PHASE1_TO_PHASE2_BLOCKCHAIN_FEE).toString()
		)
	);

	const output_box_candidates = wasm.ErgoBoxCandidates.empty();

	const first_output_builder = new wasm.ErgoBoxCandidateBuilder(
		inheritance_erg_value,
		wasm.Contract.pay_to_address(wasm.Address.from_base58(phase2_address)),
		height
	);

	tokens.forEach((token: IUTXOToken) => {
		first_output_builder.add_token(
			wasm.TokenId.from_str(token.tokenId),
			wasm.TokenAmount.from_i64(wasm.I64.from_str(token.amount))
		);
	});

	const previous_box = wasm.ErgoBox.from_json(box_to_spend_json);

	const previous_r4 = previous_box.register_value(4);
	const previous_r5 = previous_box.register_value(5);
	const previous_r6 = previous_box.register_value(6);
	const previous_r7 = previous_box.register_value(7);
	const previous_r8 = previous_box.register_value(8);
	const previous_r9 = previous_box.register_value(9);

	if (typeof previous_r4 !== "undefined")
		first_output_builder.set_register_value(4, previous_r4);
	if (typeof previous_r5 !== "undefined")
		first_output_builder.set_register_value(5, previous_r5);
	if (typeof previous_r6 !== "undefined")
		first_output_builder.set_register_value(6, previous_r6);
	if (typeof previous_r7 !== "undefined")
		first_output_builder.set_register_value(7, previous_r7);
	if (typeof previous_r8 !== "undefined")
		first_output_builder.set_register_value(8, previous_r8);
	if (typeof previous_r9 !== "undefined")
		first_output_builder.set_register_value(9, previous_r9);

	output_box_candidates.add(first_output_builder.build());

	return output_box_candidates;
}

export async function create_transaction_phase1(
	owner: string, heir: string, hpHash: string, lockTime: number, nanoErgs: number, tokens: IUTXOToken[]
): Promise<ITxConverted> {

	let wasm = (await ergolib);

	const height = await get_block_height();

	const utxos = await get_utxos();
	const input_box_selection = await get_box_selection(
		utxos,
		(nanoErgs + 2 * MIN_NANO_ERGS_IN_BOX + INERGITANCE_SERVICE_FEE_AMOUNT + TRANSACTION_PHASE1_BLOCKCHAIN_FEE),
		tokens
	);

	const first_input_box_id = input_box_selection.boxes().get(0).box_id().to_str();

	const output_box_candidates = await get_output_box_candidates_phase1(
		owner, heir, hpHash, lockTime, nanoErgs, tokens, first_input_box_id, height
	);

	const miner_fee_value = wasm.BoxValue.from_i64(wasm.I64.from_str((TRANSACTION_PHASE1_BLOCKCHAIN_FEE).toString()));
	const min_change_value = wasm.BoxValue.from_i64(wasm.I64.from_str((MIN_NANO_ERGS_IN_BOX).toString()));

	const tx_builder = wasm.TxBuilder.new(
		input_box_selection,
		output_box_candidates,
		height,
		miner_fee_value,
		wasm.Address.from_base58(owner),
		min_change_value
	);

	const data_inputs = new wasm.DataInputs();
	tx_builder.set_data_inputs(data_inputs);

	const tx = tx_builder.build().to_json();
	const converted = convert_tx_values_number_to_string(JSON.parse(tx));

	converted.inputs = converted.inputs.map((box: any) => {
		const full_box = utxos.find(utxo => utxo.boxId === box.boxId);
		if (full_box)
			return { ...full_box, extension: {} };
		else return box;
	});

	return converted;
}

export async function create_transaction_owner_withdrawal(
	owner: string, box_to_spend: INautilusUTXO, nftId: string, nanoErgs: number, tokens: IUTXOToken[]
): Promise<ITxConverted> {

	let wasm = (await ergolib);

	const height = await get_block_height();

	const utxos = [box_to_spend];
	const input_box_selection = await get_box_selection(
		utxos,
		nanoErgs,
		tokens
	);

	const output_box_candidates = await get_output_box_candidates_owner_withdrawal(
		owner, nanoErgs, tokens, nftId, height
	);

	const miner_fee_value = wasm.BoxValue.from_i64(
		wasm.I64.from_str((TRANSACTION_OWNER_WITHDRAWAL_BLOCKCHAIN_FEE).toString())
	);

	const min_change_value = wasm.BoxValue.from_i64(wasm.I64.from_str((MIN_NANO_ERGS_IN_BOX).toString()));

	const tx_builder = wasm.TxBuilder.new(
		input_box_selection,
		output_box_candidates,
		height,
		miner_fee_value,
		wasm.Address.from_base58(owner),
		min_change_value
	);

	const data_inputs = new wasm.DataInputs();
	tx_builder.set_data_inputs(data_inputs);

	const tx = tx_builder.build().to_json();
	const converted = convert_tx_values_number_to_string(JSON.parse(tx));

	converted.inputs = converted.inputs.map((box: any) => {
		const full_box = utxos.find(utxo => utxo.boxId === box.boxId);
		if (full_box)
			return { ...full_box, extension: {} };
		else return box;
	});

	return converted;
}

export async function create_transaction_phase1_to_phase2(
	heir: string, box_to_spend: INautilusUTXO, nftId: string, nanoErgs: number, tokens: IUTXOToken[]
): Promise<ITxConverted> {

	let wasm = (await ergolib);

	const height = await get_block_height();

	const utxos = [box_to_spend];
	const input_box_selection = await get_box_selection(
		utxos,
		nanoErgs,
		tokens
	);

	const output_box_candidates = await get_output_box_candidates_phase1_to_phase2(
		heir, nanoErgs, tokens,
		(await get_box_to_spend_original_json(box_to_spend.boxId)),
		nftId, height
	);

	const miner_fee_value = wasm.BoxValue.from_i64(
		wasm.I64.from_str((TRANSACTION_PHASE1_TO_PHASE2_BLOCKCHAIN_FEE).toString())
	);

	const min_change_value = wasm.BoxValue.from_i64(wasm.I64.from_str((MIN_NANO_ERGS_IN_BOX).toString()));

	const tx_builder = wasm.TxBuilder.new(
		input_box_selection,
		output_box_candidates,
		height,
		miner_fee_value,
		wasm.Address.from_base58(heir),
		min_change_value
	);

	const data_inputs = new wasm.DataInputs();
	tx_builder.set_data_inputs(data_inputs);

	const tx = tx_builder.build().to_json();
	const converted = convert_tx_values_number_to_string(JSON.parse(tx));

	converted.inputs = converted.inputs.map((box: any) => {
		const full_box = utxos.find(utxo => utxo.boxId === box.boxId);
		if (full_box)
			return { ...full_box, extension: {} };
		else return box;
	});

	return converted;
}

export async function sign_tx(unsigned_tx: ITxConverted): Promise<ISignedTx | null> {
	const ctx: any = await ergoConnector.nautilus.getContext();
	try {
		return ctx.sign_tx(unsigned_tx);
	} catch (_) { return null; }
}

export async function submit_tx(signed_tx: ISignedTx): Promise<string | null> {
	const ctx: any = await ergoConnector.nautilus.getContext();
	try {
		return ctx.submit_tx(signed_tx);
	} catch (_) { return null; }
}

export async function test_it() {
	const adr = await generate_phase1_p2s_address();
	console.log(adr);
}

export { };
