export const heirIndication_ergoscript: string = `
	{
		val purpose = "todo4inheritance"
		val role = "heir"
		val uniqueBoolHack = purpose == role || true
		sigmaProp(uniqueBoolHack && PK("heir_address"))
	}
`;
