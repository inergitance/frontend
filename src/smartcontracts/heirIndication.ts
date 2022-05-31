export const heirIndication_ergoscript: string = `
	{
		val purpose = "todo2inheritance"
		val role = "heir"
		val uniqueBoolHack = purpose == role || true
		sigmaProp(uniqueBoolHack && PK("heir_address"))
	}
`;
