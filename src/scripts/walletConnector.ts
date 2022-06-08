import {
    EXPLORER_URL, EXPLORER_BALANCE_ENDPOINT_PREFIX, EXPLORER_BALANCE_ENDPOINT_SUFIX,
    EXPLORER_TOKEN_INFO_PREFIX, EXPLORER_ASSET_SEARCH_PREFIX, EXPLORER_BOX_INFO_PREFIX,
    EXPLORER_BOXES_BY_ADDRESS_PREFIX, EXPLORER_TRANSACTION_INFO_PREFIX
} from "./blockchainParameters";

import {
    generate_owners_indication_p2s_address, generate_heir_indication_p2s_address,
    generate_phase1_p2s_address, generate_phase2_p2s_address, generate_phase3_p2s_address
} from "../smartcontracts/smartcontractsGenerator";

import { ICurrentInheritances } from "../components/CurrentInheritancesOverview";

import { get_request } from "./restApi";

export interface IToken {
    id: string,
    amount: number,
    decimals: number,
    name: string,
    description: string
}

export interface IBalanceWithTokens {
    nanoErgs: number,
    tokens: IToken[]
}

export interface IWalletProperties {
    connected: boolean;
    address: string;
    balance: IBalanceWithTokens;
}

export const WALLET_DEFAULT_STATE: IWalletProperties = {
    connected: false,
    address: "",
    balance: {
        nanoErgs: 0,
        tokens: []
    }
};

export interface IUTXOToken {
    tokenId: string,
    amount: string
}

export interface IUTXO {
    boxId: string,
    transactionId: string,
    index: number,
    ergoTree: string,
    creationHeight: number,
    value: string,
    assets: IUTXOToken[],
    additionalRegisters: any,
    confirmed: boolean
};

export interface INFTBox {
    nftId: string,
    boxId: string,
    address: string,
    phase: number
}

export async function get_address_balance(address: string): Promise<number> {

    const response = await get_request(EXPLORER_URL +
        EXPLORER_BALANCE_ENDPOINT_PREFIX +
        address +
        EXPLORER_BALANCE_ENDPOINT_SUFIX
    );

    return response.confirmed.nanoErgs;

}

export interface ITokenInfo {
    decimals: number,
    name: string,
    description: string
}

export async function get_token_info(id: string): Promise<ITokenInfo> {

    const response = await get_request(EXPLORER_URL + EXPLORER_TOKEN_INFO_PREFIX + id);

    const token_info: ITokenInfo = {
        decimals: response.decimals,
        name: response.name,
        description: response.description
    };

    return token_info;
}

interface IExplorerUTXOToken {
    tokenId: string,
    index: number,
    amount: number,
    name: string | null,
    decimals: number | null,
    type: string | null
}

interface IExplorerUTXO {
    boxId: string,
    transactionId: string,
    blockId: string,
    value: number,
    index: number,
    globalIndex: number,
    creationHeight: number,
    settlementHeight: number,
    ergoTree: string,
    address: string,
    assets: IExplorerUTXOToken[],
    additionalRegisters: any,
    spentTransactionId: string | null,
    mainChain: boolean
}

export async function get_box_to_spend(id: string): Promise<IUTXO> {

    const response: IExplorerUTXO = await get_request(EXPLORER_URL + EXPLORER_BOX_INFO_PREFIX + id);

    let utxo: IUTXO = {
        ...response, value: response.value.toString(), assets: [], confirmed: true
    };

    response.assets.forEach((token: IExplorerUTXOToken) => {
        utxo = {
            ...utxo, assets: [...utxo.assets, {
                tokenId: token.tokenId,
                // index: token.index,
                amount: token.amount.toString(),
                // name: token.name,
                // decimals: token.decimals,
                // type: token.type
            }]
        }
    });

    return utxo;
}

export async function get_box_to_spend_original_json(id: string): Promise<string> {
    const response: IExplorerUTXO = await get_request(EXPLORER_URL + EXPLORER_BOX_INFO_PREFIX + id);
    return JSON.stringify(response);
}

export async function get_box_balance(id: string, skip_token: string): Promise<IBalanceWithTokens> {

    const response = await get_request(EXPLORER_URL + EXPLORER_BOX_INFO_PREFIX + id);

    const box_balance: IBalanceWithTokens = {
        nanoErgs: response.value,
        tokens: []
    }

    for (var i = 0; i < response.assets.length; ++i) {
        const token = response.assets[i];
        if (token.tokenId === skip_token) continue;
        const token_info = await get_token_info(token.tokenId);
        box_balance.tokens = [...box_balance.tokens,
        {
            id: token.tokenId,
            amount: parseInt(token.amount),
            decimals: token_info.decimals,
            name: token_info.name,
            description: token_info.description
        }
        ];
    }

    return box_balance;
}

export async function get_nft_box_balance(nftId: string): Promise<IBalanceWithTokens> {

    const box_balance: IBalanceWithTokens = {
        nanoErgs: 0,
        tokens: []
    }

    if (!(await is_nft(nftId))) return box_balance;

    const box_with_nft = await get_box_containing_nft(nftId);
    if (box_with_nft === null) return box_balance;

    return get_box_balance(box_with_nft.boxId, nftId);
}


export async function get_total_balance_including_tokens(utxos: IUTXO[]): Promise<IBalanceWithTokens> {
    const accumulator: IBalanceWithTokens = { nanoErgs: 0, tokens: [] };
    for (var i = 0; i < utxos.length; ++i) {
        const utxo = utxos[i];
        accumulator.nanoErgs += parseInt(utxo.value);
        for (var j = 0; j < utxo.assets.length; ++j) {
            const token = utxo.assets[j];
            if (!accumulator.tokens.find(tkn => (tkn.id === token.tokenId))) {
                const token_info = await get_token_info(token.tokenId);
                accumulator.tokens = [...accumulator.tokens,
                {
                    id: token.tokenId,
                    amount: parseInt(token.amount),
                    decimals: token_info.decimals,
                    name: token_info.name,
                    description: token_info.description
                }
                ];
            } else {
                const tmp_tkn: IToken | undefined = accumulator.tokens.find(tkn => (tkn.id === token.tokenId));
                if (tmp_tkn) {
                    tmp_tkn.amount += parseInt(token.amount);
                }
            }
        }
    }
    return accumulator;
}

export async function is_nft(nft: string): Promise<boolean> {
    const response = await get_request(EXPLORER_URL + EXPLORER_TOKEN_INFO_PREFIX + nft);
    if (response.status === 404 || response.emissionAmount !== 1) return false;
    return true;
}

async function address_to_inheritance_phase(address: string): Promise<number> {
    const p1_addr: string = await generate_phase1_p2s_address();
    const p2_addr: string = await generate_phase2_p2s_address();
    const p3_addr: string = await generate_phase3_p2s_address();
    if (address === p1_addr) return 1;
    if (address === p2_addr) return 2;
    if (address === p3_addr) return 3;
    return 0;
}

export async function get_box_containing_nft(nft: string): Promise<INFTBox | null> {

    const test_for_nft = await is_nft(nft);
    if (!test_for_nft) return null;

    const response = await get_request(EXPLORER_URL + EXPLORER_ASSET_SEARCH_PREFIX + nft);
    if (response.items.length === 0) return null;

    //get boxId of latest box which contained this NFT
    const boxId = response.items[response.items.length - 1].boxId;

    const response2 = await get_request(EXPLORER_URL + EXPLORER_BOX_INFO_PREFIX + boxId);
    if (response2.spentTransactionId != null) return null;

    const nftbox_info: INFTBox = {
        nftId: nft,
        boxId: boxId,
        address: response2.address,
        phase: (await address_to_inheritance_phase(response2.address))
    }

    return nftbox_info;
}

async function get_role_inheritance_boxes(role_indication_address: string): Promise<INFTBox[]> {

    const result: INFTBox[] = [];

    const response = await get_request(
        EXPLORER_URL + EXPLORER_BOXES_BY_ADDRESS_PREFIX + role_indication_address
    );

    if (response.total === 0) return result;

    for (var i = 0; i < (response.total); ++i) {

        const response2 = await get_request(
            EXPLORER_URL + EXPLORER_TRANSACTION_INFO_PREFIX + response.items[i].transactionId
        );

        const nft_id = await response2.inputs[0].boxId;
        if (!(await is_nft(nft_id))) continue;

        const nft_box = await get_box_containing_nft(nft_id);
        if (nft_box === null || nft_box.phase === 0) continue;

        result.push(nft_box);

    }

    return result;
}

export async function get_owner_inheritance_boxes(address: string): Promise<INFTBox[]> {
    const owner_indication_address = await generate_owners_indication_p2s_address(address);
    return get_role_inheritance_boxes(owner_indication_address);
}

export async function get_heir_inheritance_boxes(address: string): Promise<INFTBox[]> {
    const heir_indication_address = await generate_heir_indication_p2s_address(address);
    return get_role_inheritance_boxes(heir_indication_address);
}

export async function get_users_inheritances(address: string): Promise<ICurrentInheritances> {
    const owner_of = await get_owner_inheritance_boxes(address);
    const heir_of = await get_heir_inheritance_boxes(address);
    return {
        loaded: true,
        owner_of: owner_of,
        heir_of: heir_of
    };
}
