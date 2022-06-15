export const phase3_ergoscript: string = `
{

	val owner = SELF.R4[SigmaProp].get

	val holiday_protector_hash = SELF.R6[Coll[Byte]].get

	val blocks_delay = SELF.R7[Int].get

	val nft_id = SELF.R8[Coll[Byte]].get

	val contain_nft = {(output_box: Box) => anyOf(output_box.tokens.map{ (token: (Coll[Byte],Long)) => token._1 == nft_id })}

	val nft_spent = !(OUTPUTS.exists(contain_nft))

	val sent_to_phase1 = blake2b256(OUTPUTS(0).propositionBytes) == SELF.R9[Coll[Byte]].get
	
	val registers_preserved = {
		OUTPUTS(0).R4[SigmaProp].get == SELF.R4[SigmaProp].get &&
		OUTPUTS(0).R5[SigmaProp].get == SELF.R5[SigmaProp].get &&
		OUTPUTS(0).R6[Coll[Byte]].get == SELF.R6[Coll[Byte]].get &&
		OUTPUTS(0).R7[Int].get == SELF.R7[Int].get &&
		OUTPUTS(0).R8[Coll[Byte]].get == SELF.R8[Coll[Byte]].get &&
		OUTPUTS(0).R9[Coll[Byte]].get == SELF.R9[Coll[Byte]].get
	}
	
	val ergs_preserved = OUTPUTS(0).value >= (SELF.value - 10000000L)
	val min_ergs = OUTPUTS(0).value >= (11000000L)

	val tokens_preserved = OUTPUTS(0).tokens == SELF.tokens

	val all_preserved = registers_preserved && ergs_preserved && tokens_preserved

	val hash_of_preimage_in_output = blake2b256(OUTPUTS(0).R6[Coll[Byte]].get)

	val hash_preimage_ok = holiday_protector_hash == hash_of_preimage_in_output

	val enough_time_elapsed_for_anybody_withdrawal = HEIGHT >= (SELF.creationInfo._1 + blocks_delay)

	val owner_spending = owner && nft_spent
	val owner_draining = owner && min_ergs && sent_to_phase1 && registers_preserved && (!nft_spent)
	val anybody_spending = enough_time_elapsed_for_anybody_withdrawal && sent_to_phase1 && all_preserved

	owner_spending || owner_draining || anybody_spending

}
`;

export const phase3_p2s_hardcoded_mainnet: string = "todo";
export const phase3_p2s_hardcoded_testnet: string = "26EykmwmEXxLP7Ghhdp5cuNW8M1uburHDmP1KB7DnE5e5haS5pQQLg6c7KEni9xzHALpFmnV3GmuFGnrf39dBvYPzhbPoppfYVqbxht66ijko6yGA5QwwQWr3HJXGhCvwsCKg2jvzmLZWDPpQicYBuGA5sqFEGYKe4meKijd8e5xw8hYpVWJ2QMjmJd29deEEhqRCLGHHvz59VaVh72z2GRYfLtvHefQji69ZAq47poT43m5GxtzRHov2uFxKPe2Yvn4sw2soqfxxvrufjdPmMuYGnLHbLLLS8KEwagbjsdd4vxixvTvQX1q3H4YM566k1D9";

