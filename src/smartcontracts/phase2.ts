export const phase2_ergoscript: string = `
{

	val owner = SELF.R4[SigmaProp].get
	val heir = SELF.R5[SigmaProp].get
	val holiday_protector_hash = SELF.R6[Coll[Byte]].get

	val blocks_delay = SELF.R7[Int].get

	val nft_id = SELF.R8[Coll[Byte]].get

	val contain_nft = {(output_box: Box) => anyOf(output_box.tokens.map{ (token: (Coll[Byte],Long)) => token._1 == nft_id })}

	val nft_spent = !(OUTPUTS.exists(contain_nft))

	val sent_to_phase1 = blake2b256(OUTPUTS(0).propositionBytes) == SELF.R9[Coll[Byte]].get
	val sent_to_phase3 = blake2b256(OUTPUTS(0).propositionBytes) == fromBase64("phase3_propBytes_hash_base64")
	
	val registers_preserved_without_R6 = {
		OUTPUTS(0).R4[SigmaProp].get == SELF.R4[SigmaProp].get &&
		OUTPUTS(0).R5[SigmaProp].get == SELF.R5[SigmaProp].get &&
		OUTPUTS(0).R7[Int].get == SELF.R7[Int].get &&
		OUTPUTS(0).R8[Coll[Byte]].get == SELF.R8[Coll[Byte]].get &&
		OUTPUTS(0).R9[Coll[Byte]].get == SELF.R9[Coll[Byte]].get
	}
	
	val ergs_preserved = OUTPUTS(0).value >= (SELF.value - 10000000L)
	val min_ergs = OUTPUTS(0).value >= (11000000L)

	val tokens_preserved = OUTPUTS(0).tokens == SELF.tokens

	val all_preserved = registers_preserved_without_R6 && ergs_preserved && tokens_preserved

	val hash_of_preimage_in_output = blake2b256(OUTPUTS(0).R6[Coll[Byte]].get)

	val hash_preimage_ok = holiday_protector_hash == hash_of_preimage_in_output

	val enough_time_elapsed_for_heir_withdrawal = HEIGHT >= (SELF.creationInfo._1 + blocks_delay)

	val registers_preserved = {
		registers_preserved_without_R6 &&
		OUTPUTS(0).R6[Coll[Byte]].get == SELF.R6[Coll[Byte]].get
	}

	val owner_spending = owner && nft_spent
	val owner_draining = owner && min_ergs && sent_to_phase1 && registers_preserved && (!nft_spent)
	val heir_spending = heir && enough_time_elapsed_for_heir_withdrawal && nft_spent
	val holiday_protector_spending = hash_preimage_ok && sent_to_phase3 && all_preserved

	owner_spending || owner_draining || heir_spending || holiday_protector_spending
	
}
`;

export const phase2_p2s_hardcoded_mainnet: string = "todo";
export const phase2_p2s_hardcoded_testnet: string = "DGSRtQxisry5iVVyHszPYkSHnc6qQynxntwbX3pd7EsXpazJjrzpX9Jt8pnmd1K5VFHM6vT3NuihYMjL8JYuNB5gB6y1HKwcQX9Uc6FoG6dwtcPpZBxR5fNmhXp1Z5Dq4ZR1G1Xnyatcru26TPYHicp8izf5nfi9zw11J7TRozLh5HnfCcjRjEuZkFszbu6wzmVFz6S8KyguZWup3BHJQiqetAzmvVzvR3dV43exyWsdWNFXPjJSDXcnUdgrknJ7G13rx3stm1MM2f1qrDB96zkjjdnqFE9eYPsD2sa5xQ4GDT5LMxKikELVMPykwBhX5tLXJDctS7JL27WSKjnRAdvPjZcoakGL7U4e2TvuhfhMneTXgvvRRhVG9dBjSS6MimuUFVaakTDM4ts8GXkfZUzbrnyutHmRW7Q";

