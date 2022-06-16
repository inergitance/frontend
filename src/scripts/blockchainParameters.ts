export const USE_MAINNET = false;

export const NANO_ERGS_IN_ONE_ERG: number = 1000000000;

export const MIN_NANO_ERGS_IN_BOX: number = 1000000;

export const MAX_UNIQUE_TOKENS_IN_BOX: number = 4;

export const BLOCK_TIME_SECONDS: number = 120;

export const TRANSACTION_PHASE1_BLOCKCHAIN_FEE: number = 10000000;
export const TRANSACTION_OWNER_WITHDRAWAL_BLOCKCHAIN_FEE: number = 2000000;
export const TRANSACTION_PHASE1_TO_PHASE2_BLOCKCHAIN_FEE: number = 2000000;

export const ADDRESS_NETWORK_TYPE_MAINNET: number = 0x00;
export const ADDRESS_NETWORK_TYPE_TESTNET: number = 0x10;
export const ADDRESS_NETWORK_TYPE_CURRENT: number =
	USE_MAINNET ? ADDRESS_NETWORK_TYPE_MAINNET : ADDRESS_NETWORK_TYPE_TESTNET;

//in case of true do not compile P2S addresses but use the pre-compiled ones
//(avoid not neccessary request to node)
export const USE_HARDCODED_P2S_ADDRESSES: boolean = false;

export const MAINNET_EXPLORER_URL: string = "https://api.ergoplatform.com";
export const TESTNET_EXPLORER_URL: string = "https://api-testnet.ergoplatform.com";
export const EXPLORER_URL = USE_MAINNET ? MAINNET_EXPLORER_URL : TESTNET_EXPLORER_URL;

export const MAINNET_NODE_URL: string = "https://ergonode.blocpow.io";
export const TESTNET_NODE_URL: string = "http://213.239.193.208:9052";
export const NODE_URL = USE_MAINNET ? MAINNET_NODE_URL : TESTNET_NODE_URL;

export const EXPLORER_BALANCE_ENDPOINT_PREFIX: string = "/api/v1/addresses/";
export const EXPLORER_BALANCE_ENDPOINT_SUFIX: string = "/balance/total";

export const EXPLORER_TOKEN_INFO_PREFIX: string = "/api/v1/tokens/";
export const EXPLORER_TOKEN_INFO_SUFIX: string = "";

export const EXPLORER_BLOKCHAIN_HEIGHT_PREFIX: string = "/api/v1/blocks?limit=1";
export const EXPLORER_BLOKCHAIN_HEIGHT_SUFIX: string = "";

export const EXPLORER_ASSET_SEARCH_PREFIX: string = "/api/v1/assets/search/byTokenId?query=";
export const EXPLORER_ASSET_SEARCH_SUFIX: string = "";

export const EXPLORER_BOX_INFO_PREFIX: string = "/api/v1/boxes/";
export const EXPLORER_BOX_INFO_SUFIX: string = "";

export const EXPLORER_BOXES_BY_ADDRESS_PREFIX: string = "/api/v1/boxes/byAddress/";
export const EXPLORER_BOXES_BY_ADDRESS_SUFIX: string = "";

export const EXPLORER_TRANSACTION_INFO_PREFIX: string = "/api/v1/transactions/";
export const EXPLORER_TRANSACTION_INFO_SUFIX: string = "";

export const NODE_COMPILE_P2S_ENDPOINT_PREFIX: string = "/script/p2sAddress";
export const NODE_COMPILE_P2S_ENDPOINT_SUFIX: string = "";

export const NODE_ADDRESS_TO_TREE_PREFIX: string = "/script/addressToTree/";
export const NODE_ADDRESS_TO_TREE_SUFIX: string = "";
