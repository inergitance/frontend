export const phase1_ergoscript: string = `
{
	
	val owner = SELF.R4[SigmaProp].get
	val heir = SELF.R5[SigmaProp].get

	val nft_id = SELF.R8[Coll[Byte]].get

	val contain_nft = {(output_box: Box) => anyOf(output_box.tokens.map{ (token: (Coll[Byte],Long)) => token._1 == nft_id })}

	val nft_spent = !(OUTPUTS.exists(contain_nft))

	val sent_back_to_itself = OUTPUTS(0).propositionBytes == SELF.propositionBytes
	val sent_to_phase2 = blake2b256(OUTPUTS(0).propositionBytes) == fromBase64("phase2_propBytes_hash_base64")
	
	val registers_preserved = {
		OUTPUTS(0).R4[SigmaProp].get == SELF.R4[SigmaProp].get &&
		OUTPUTS(0).R5[SigmaProp].get == SELF.R5[SigmaProp].get &&
		OUTPUTS(0).R6[Coll[Byte]].get == SELF.R6[Coll[Byte]].get &&
		OUTPUTS(0).R7[Int].get == SELF.R7[Int].get &&
		OUTPUTS(0).R8[Coll[Byte]].get == SELF.R8[Coll[Byte]].get &&
		OUTPUTS(0).R9[Coll[Byte]].get == blake2b256(SELF.propositionBytes)
	}
	
	val ergs_preserved = OUTPUTS(0).value >= (SELF.value - 10000000L)
	val min_ergs = OUTPUTS(0).value >= (11000000L)
	
	val tokens_preserved = OUTPUTS(0).tokens == SELF.tokens

	val all_preserved = registers_preserved && ergs_preserved && tokens_preserved

	val owner_spending = owner && nft_spent
	val owner_draining = owner && min_ergs && sent_back_to_itself && registers_preserved && (!nft_spent)
	val heir_spending = heir && sent_to_phase2 && all_preserved

	owner_spending || owner_draining || heir_spending

}
`;