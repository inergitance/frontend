export const ownerIndication_ergoscript: string = `
	{
		val purpose = "todo2inheritance"
		val role = "owner"
		val uniqueBoolHack = purpose == role || true
		sigmaProp(uniqueBoolHack && PK("owner_address"))
	}
`;
